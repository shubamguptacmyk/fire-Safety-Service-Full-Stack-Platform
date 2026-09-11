import { Notification, INotification, NotificationType } from "../models/Notification";
import { NotificationLog, ReminderType, DeliveryChannel } from "../models/NotificationLog";
import { Types } from "mongoose";

export interface SendReminderParams {
  userId?: string | Types.ObjectId;
  recipientEmail?: string;
  recipientPhone?: string;
  type: ReminderType;
  entityId: string;
  intervalDays: number;
  title: string;
  message: string;
  link?: string;
}

export class NotificationService {
  /**
   * Send an in-app notification to a user
   */
  static async sendInApp(
    userId: string | Types.ObjectId,
    title: string,
    message: string,
    type: NotificationType = "general",
    link?: string,
    metadata?: Record<string, any>
  ): Promise<INotification> {
    return await Notification.create({
      userId: new Types.ObjectId(userId.toString()),
      title,
      message,
      type,
      link,
      metadata,
    });
  }

  /**
   * Dispatch a scheduled reminder across in-app, SMS, email, and WhatsApp mock channels.
   * Enforces deduplication via NotificationLog compound unique index.
   */
  static async dispatchReminder(params: SendReminderParams): Promise<boolean> {
    const { userId, recipientEmail, recipientPhone, type, entityId, intervalDays, title, message, link } = params;

    let dispatchedAny = false;

    // 1. In-App Notification (if user is registered)
    if (userId) {
      try {
        const alreadyLogged = await NotificationLog.findOne({
          entityId,
          type,
          intervalDays,
          channel: "in-app",
        });

        if (!alreadyLogged) {
          await this.sendInApp(
            userId,
            title,
            message,
            type.startsWith("Refill") || type.startsWith("Inspection") ? "equipment" : "amc",
            link
          );

          await NotificationLog.create({
            recipient: userId.toString(),
            recipientType: "User",
            type,
            entityId,
            intervalDays,
            channel: "in-app",
            status: "sent",
            message,
          });

          dispatchedAny = true;
        }
      } catch (err: any) {
        // Ignore duplicate key error in race conditions
        if (err.code !== 11000) {
          console.error("Error creating in-app reminder notification:", err);
        }
      }
    }

    // 2. Email Notification (Mock / Dev Mode)
    if (recipientEmail) {
      try {
        const alreadyLogged = await NotificationLog.findOne({
          entityId,
          type,
          intervalDays,
          channel: "email",
        });

        if (!alreadyLogged) {
          // Log mock email dispatch
          console.log(`[MOCK EMAIL DISPATCH] To: ${recipientEmail} | Subject: ${title} | Body: ${message}`);

          await NotificationLog.create({
            recipient: recipientEmail,
            recipientType: "Email",
            type,
            entityId,
            intervalDays,
            channel: "email",
            status: "logged_mock",
            message,
          });

          dispatchedAny = true;
        }
      } catch (err: any) {
        if (err.code !== 11000) {
          console.error("Error logging email reminder:", err);
        }
      }
    }

    // 3. SMS Notification (Mock Mode)
    if (recipientPhone) {
      try {
        const alreadyLogged = await NotificationLog.findOne({
          entityId,
          type,
          intervalDays,
          channel: "sms",
        });

        if (!alreadyLogged) {
          console.log(`[MOCK SMS DISPATCH] To: ${recipientPhone} | Message: ${message}`);

          await NotificationLog.create({
            recipient: recipientPhone,
            recipientType: "Phone",
            type,
            entityId,
            intervalDays,
            channel: "sms",
            status: "logged_mock",
            message,
          });

          dispatchedAny = true;
        }
      } catch (err: any) {
        if (err.code !== 11000) {
          console.error("Error logging SMS reminder:", err);
        }
      }
    }

    return dispatchedAny;
  }

  /**
   * Get paginated notifications for a user
   */
  static async getUserNotifications(
    userId: string | Types.ObjectId,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { userId: new Types.ObjectId(userId.toString()) };
    if (options.unreadOnly) {
      filter.isRead = false;
    }

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: new Types.ObjectId(userId.toString()), isRead: false }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(notificationId: string, userId: string | Types.ObjectId) {
    return await Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId.toString()) },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string | Types.ObjectId) {
    return await Notification.updateMany(
      { userId: new Types.ObjectId(userId.toString()), isRead: false },
      { isRead: true }
    );
  }

  /**
   * Delete a notification (by customer owner or admin)
   */
  static async deleteNotification(
    notificationId: string,
    userId?: string | Types.ObjectId,
    isAdmin: boolean = false
  ) {
    const query: Record<string, any> = { _id: new Types.ObjectId(notificationId) };
    if (!isAdmin && userId) {
      query.userId = new Types.ObjectId(userId.toString());
    }

    return await Notification.findOneAndDelete(query);
  }

  /**
   * Admin: List all notifications with filtering and pagination
   */
  static async getAdminNotifications(
    options: {
      page?: number;
      limit?: number;
      type?: string;
      isRead?: boolean;
      userId?: string;
    } = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (options.type) filter.type = options.type;
    if (typeof options.isRead === "boolean") filter.isRead = options.isRead;
    if (options.userId) filter.userId = new Types.ObjectId(options.userId);

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .populate("userId", "name email phone role companyName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
