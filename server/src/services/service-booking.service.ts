import {
  ServiceBooking,
  IServiceBooking,
  ServiceBookingStatus,
} from "../models/ServiceBooking";
import { Technician } from "../models/Technician";
import {
  CreateServiceBookingInput,
  UpdateServiceStatusInput,
  SubmitJobCardInput,
  ServiceQueryInput,
} from "../validators/service.validators";
import { NotificationService } from "./notification.service";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export class ServiceBookingService {
  /**
   * Seed demonstration bookings and job cards if database is empty
   */
  static async seedDefaultBookingsIfEmpty(defaultUserId?: Types.ObjectId): Promise<void> {
    const count = await ServiceBooking.countDocuments();
    if (count === 0 && defaultUserId) {
      await ServiceBooking.create([
        {
          bookingId: "SRV-2026-0211",
          userId: defaultUserId,
          customerName: "Turbhe Logistics Park Association",
          companyName: "Turbhe Logistics Park Ltd",
          phone: "9820123456",
          email: "facilities@turbhelogistics.com",
          serviceType: "Quarterly AMC Inspection",
          serviceAddress: {
            street: "Plot C-12, Turbhe MIDC",
            landmark: "Opposite Turbhe Railway Station",
            city: "Navi Mumbai",
            state: "Maharashtra",
            pincode: "400705",
          },
          preferredDate: new Date("2026-03-12"),
          preferredTime: "Morning (10:00 AM - 1:00 PM)",
          equipmentDetails: "8x 4kg ABC Extinguishers, 2x 4.5kg CO2 Units, 1x Hose Reel Drum",
          problemDescription: "Quarterly periodic maintenance and pressure gauge verification.",
          status: "Completed",
          assignedTechnicianName: "Ganesh Patil",
          assignedTechnicianPhone: "9820123456",
          equipmentList: [
            { type: "SafePro 4kg ABC", capacity: "4kg", pressureBar: 16, result: "Pass" },
            { type: "FireShield 4.5kg CO2", capacity: "4.5kg", pressureBar: 250, result: "Pass" },
          ],
          serviceReport: {
            jobCardNumber: "JC-2026-0419",
            summary: "Quarterly safety inspection carried out per IS 2190 guidelines.",
            remarks: "All pressure gauges verified in operating range. Hose nozzles unclogged.",
            pressureTestPassed: true,
            formBRef: "FORM-B/MFS/2026/0881",
            completedAt: new Date("2026-03-12T14:30:00Z"),
          },
          cost: {
            serviceFee: 3500,
            partsFee: 0,
            tax: 630,
            total: 4130,
            paymentStatus: "Covered by AMC",
          },
          statusHistory: [
            { status: "Requested", changedAt: new Date("2026-03-10") },
            { status: "Assigned", changedAt: new Date("2026-03-11"), notes: "Assigned to Ganesh Patil" },
            { status: "Completed", changedAt: new Date("2026-03-12"), notes: "Inspection completed" },
          ],
        },
        {
          bookingId: "SRV-2026-0284",
          userId: defaultUserId,
          customerName: "Turbhe Logistics Park Association",
          companyName: "Turbhe Logistics Park Ltd",
          phone: "9820123456",
          email: "facilities@turbhelogistics.com",
          serviceType: "Cylinder Refilling",
          serviceAddress: {
            street: "Plot C-12, Turbhe MIDC",
            city: "Navi Mumbai",
            state: "Maharashtra",
            pincode: "400705",
          },
          preferredDate: new Date("2026-01-20"),
          preferredTime: "Morning (10:00 AM - 1:00 PM)",
          equipmentDetails: "3x 4.5kg CO2 Extinguishers (IS 2878)",
          problemDescription: "Hydro-testing and certified gas refilling.",
          status: "Completed",
          assignedTechnicianName: "Mahesh Kulkarni",
          assignedTechnicianPhone: "9820987654",
          serviceReport: {
            jobCardNumber: "JC-2026-0284",
            summary: "Hydraulic pressure testing carried out at 250 bar.",
            remarks: "PESO expansion limits verified. Stamped with test date 01/26.",
            pressureTestPassed: true,
            formBRef: "HT-CERT-2026-302",
            completedAt: new Date("2026-01-20T16:00:00Z"),
          },
          cost: {
            serviceFee: 2400,
            partsFee: 450,
            tax: 513,
            total: 3363,
            paymentStatus: "Paid",
          },
          statusHistory: [
            { status: "Requested", changedAt: new Date("2026-01-18") },
            { status: "Completed", changedAt: new Date("2026-01-20") },
          ],
        },
      ]);
    }
  }

  /**
   * Create a new service booking
   */
  static async createBooking(
    data: CreateServiceBookingInput,
    userId?: string | Types.ObjectId
  ): Promise<IServiceBooking> {
    const timestamp = Date.now().toString().slice(-6);
    const bookingId = `SRV-${new Date().getFullYear()}-${timestamp}`;

    const booking = await ServiceBooking.create({
      bookingId,
      userId: userId ? new Types.ObjectId(userId.toString()) : undefined,
      customerName: data.customerName,
      companyName: data.companyName,
      phone: data.phone,
      email: data.email,
      serviceType: data.serviceType,
      serviceAddress: data.serviceAddress,
      preferredDate: new Date(data.preferredDate),
      preferredTime: data.preferredTime,
      equipmentDetails: data.equipmentDetails,
      problemDescription: data.problemDescription,
      status: "Requested",
      statusHistory: [
        {
          status: "Requested",
          changedAt: new Date(),
          changedBy: userId ? new Types.ObjectId(userId.toString()) : undefined,
          notes: "Service request submitted by customer",
        },
      ],
    });

    if (userId) {
      await NotificationService.sendInApp(
        userId,
        "Service Booking Received",
        `Your request for ${data.serviceType} (Ref: ${bookingId}) has been received. Our team will contact you shortly.`,
        "service",
        "/service-history"
      );
    }

    // Mock notification dispatch
    console.log(
      `[MOCK NOTIFICATION] Booking Confirmed: ${bookingId} for ${data.customerName} on ${data.preferredDate}`
    );

    return booking;
  }

  /**
   * Get user's service bookings / job cards
   */
  static async getUserBookings(
    userId: string | Types.ObjectId,
    query: { status?: ServiceBookingStatus; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId.toString()),
    };
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      ServiceBooking.find(filter).sort({ preferredDate: -1, createdAt: -1 }).skip(skip).limit(limit),
      ServiceBooking.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single service booking
   */
  static async getBookingById(id: string, userId?: string | Types.ObjectId, isAdmin = false) {
    const filter: Record<string, any> = {
      $or: [{ _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null }, { bookingId: id }].filter(
        (cond) => cond._id !== null || cond.bookingId
      ),
    };

    if (!isAdmin && userId) {
      filter.userId = new Types.ObjectId(userId.toString());
    }

    return await ServiceBooking.findOne(filter).populate("assignedTechnician");
  }

  /**
   * Admin: query all service bookings
   */
  static async getAllBookings(query: ServiceQueryInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.serviceType) filter.serviceType = query.serviceType;
    if (query.search) {
      filter.$or = [
        { bookingId: new RegExp(query.search, "i") },
        { customerName: new RegExp(query.search, "i") },
        { phone: new RegExp(query.search, "i") },
        { companyName: new RegExp(query.search, "i") },
        { "serviceAddress.city": new RegExp(query.search, "i") },
      ];
    }

    const [items, total] = await Promise.all([
      ServiceBooking.find(filter)
        .populate("assignedTechnician", "name phone email")
        .sort({ preferredDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceBooking.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Admin: update status or assign technician
   */
  static async updateBookingStatus(
    id: string,
    data: UpdateServiceStatusInput,
    changedByAdminId?: string | Types.ObjectId
  ): Promise<IServiceBooking | null> {
    const booking = await ServiceBooking.findById(id);
    if (!booking) return null;

    const oldStatus = booking.status;
    booking.status = data.status;

    // Handle technician assignment
    if (data.assignedTechnician) {
      const tech = await Technician.findById(data.assignedTechnician);
      if (tech) {
        booking.assignedTechnician = tech._id;
        booking.assignedTechnicianName = tech.name;
        booking.assignedTechnicianPhone = tech.phone;

        if (oldStatus !== "Assigned" && oldStatus !== "In Progress") {
          await Technician.findByIdAndUpdate(tech._id, { $inc: { activeJobsCount: 1 } });
        }
      }
    }

    // Append status history
    booking.statusHistory.push({
      status: data.status,
      changedAt: new Date(),
      changedBy: changedByAdminId ? new Types.ObjectId(changedByAdminId.toString()) : undefined,
      notes: data.notes || `Status updated from ${oldStatus} to ${data.status}`,
    });

    await booking.save();

    // Notify user of status update
    if (booking.userId) {
      await NotificationService.sendInApp(
        booking.userId,
        `Service Update: ${booking.serviceType}`,
        `Your service booking ${booking.bookingId} is now ${booking.status}.${
          booking.assignedTechnicianName ? ` Assigned technician: ${booking.assignedTechnicianName}.` : ""
        }`,
        "service",
        "/service-history"
      );
    }

    return booking;
  }

  /**
   * Submit Job Card & completion report
   */
  static async submitJobCard(
    id: string,
    data: SubmitJobCardInput,
    adminOrTechUserId?: string | Types.ObjectId
  ): Promise<IServiceBooking | null> {
    const booking = await ServiceBooking.findById(id);
    if (!booking) return null;

    const jobCardNumber = data.jobCardNumber || `JC-${new Date().getFullYear()}-${booking.bookingId.slice(-4)}`;

    booking.serviceReport = {
      jobCardNumber,
      summary: data.summary || "On-site fire safety service successfully executed.",
      remarks: data.remarks,
      pressureTestPassed: data.pressureTestPassed ?? true,
      formBRef: data.formBRef,
      partsReplaced: data.partsReplaced,
      completedAt: new Date(),
    };

    if (data.equipmentList && data.equipmentList.length > 0) {
      booking.equipmentList = data.equipmentList.map((eq) => ({
        equipmentId: eq.equipmentId ? new Types.ObjectId(eq.equipmentId) : undefined,
        serialNumber: eq.serialNumber,
        type: eq.type,
        capacity: eq.capacity,
        pressureBar: eq.pressureBar,
        result: eq.result,
      }));
    }

    if (data.photographs && data.photographs.length > 0) {
      booking.photographs = data.photographs.map((p) => ({
        url: p.url,
        caption: p.caption,
        phase: p.phase,
      }));
    }

    if (data.cost) {
      booking.cost = data.cost;
    }

    booking.status = "Completed";
    booking.statusHistory.push({
      status: "Completed",
      changedAt: new Date(),
      changedBy: adminOrTechUserId ? new Types.ObjectId(adminOrTechUserId.toString()) : undefined,
      notes: `Job Card ${jobCardNumber} generated and signed off`,
    });

    await booking.save();

    // If technician was assigned, update their metrics
    if (booking.assignedTechnician) {
      await Technician.findByIdAndUpdate(booking.assignedTechnician, {
        $inc: { activeJobsCount: -1, completedJobsCount: 1 },
      });
    }

    // Notify customer
    if (booking.userId) {
      await NotificationService.sendInApp(
        booking.userId,
        "Service Completed — Job Card Ready",
        `Service visit for ${booking.bookingId} (${booking.serviceType}) has been completed. View your job card and compliance certificate.`,
        "service",
        "/service-history"
      );
    }

    return booking;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(id: string, userId?: string, reason?: string): Promise<IServiceBooking | null> {
    const booking = await ServiceBooking.findById(id);
    if (!booking) return null;
    if (userId && booking.userId && booking.userId.toString() !== userId) {
      throw ApiError.forbidden("You do not have permission to cancel this booking");
    }
    if (["Completed", "In Progress"].includes(booking.status)) {
      throw ApiError.badRequest("Cannot cancel a service that is in progress or completed");
    }
    booking.status = "Cancelled";
    booking.statusHistory.push({
      status: "Cancelled",
      changedAt: new Date(),
      notes: reason || "Cancelled by customer",
    });
    await booking.save();
    return booking;
  }
}
