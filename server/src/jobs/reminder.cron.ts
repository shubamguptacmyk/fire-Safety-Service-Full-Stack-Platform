import cron from "node-cron";
import { CustomerEquipment, calculateEquipmentStatus } from "../models/CustomerEquipment";
import { AMCContract, calculateFormBStatus } from "../models/AMCContract";
import { User } from "../models/User";
import { NotificationService } from "../services/notification.service";

const REMINDER_INTERVALS = [30, 15, 7, 1, 0, -1]; // -1 represents overdue

export async function runEquipmentReminderScan(): Promise<{
  inspectedEquipmentCount: number;
  remindersDispatched: number;
}> {
  console.log("[CRON] Starting Equipment & AMC Reminder Scan...");
  const now = new Date();
  let remindersDispatched = 0;

  // 1. Scan all active equipment
  const equipmentList = await CustomerEquipment.find({});
  for (const eq of equipmentList) {
    // Update live status if needed
    const currentStatus = calculateEquipmentStatus(eq.nextRefillDate, eq.nextInspectionDate);
    if (eq.status !== currentStatus) {
      eq.status = currentStatus;
      await eq.save();
    }

    // Fetch user details for notification
    const user = await User.findById(eq.userId).select("name email phone").lean();
    if (!user) continue;

    const refillDiffDays = Math.ceil(
      (new Date(eq.nextRefillDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const inspectDiffDays = Math.ceil(
      (new Date(eq.nextInspectionDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check refill reminders
    for (const interval of REMINDER_INTERVALS) {
      let isMatch = false;
      let reminderTitle = "";
      let reminderMessage = "";

      if (interval === -1 && refillDiffDays < 0) {
        isMatch = true;
        reminderTitle = `⚠️ OVERDUE: Refill required for ${eq.name} (${eq.equipmentId})`;
        reminderMessage = `Your fire extinguisher ${eq.name} (${eq.equipmentId}) at ${eq.location} is overdue for refilling since ${new Date(eq.nextRefillDate).toLocaleDateString("en-IN")}. Book a certified refill now.`;
      } else if (interval === 0 && refillDiffDays === 0) {
        isMatch = true;
        reminderTitle = `🚨 DUE TODAY: Extinguisher Refill for ${eq.name}`;
        reminderMessage = `Refill is due today for ${eq.name} (${eq.equipmentId}) installed at ${eq.location}. Contact our certified technician team today.`;
      } else if (interval > 0 && refillDiffDays === interval) {
        isMatch = true;
        reminderTitle = `🔔 Upcoming Refill in ${interval} Days: ${eq.name}`;
        reminderMessage = `Safety reminder: Refill for ${eq.name} (${eq.equipmentId}) at ${eq.location} is scheduled for ${new Date(eq.nextRefillDate).toLocaleDateString("en-IN")} (${interval} days remaining).`;
      }

      if (isMatch) {
        const sent = await NotificationService.dispatchReminder({
          userId: eq.userId,
          recipientEmail: user.email,
          recipientPhone: user.phone,
          type: "Refill_Reminder",
          entityId: eq.equipmentId,
          intervalDays: interval,
          title: reminderTitle,
          message: reminderMessage,
          link: `/my-equipment`,
        });
        if (sent) remindersDispatched++;
      }
    }

    // Check inspection reminders
    for (const interval of REMINDER_INTERVALS) {
      let isMatch = false;
      let reminderTitle = "";
      let reminderMessage = "";

      if (interval === -1 && inspectDiffDays < 0) {
        isMatch = true;
        reminderTitle = `⚠️ OVERDUE: Quarterly Inspection for ${eq.name} (${eq.equipmentId})`;
        reminderMessage = `Statutory periodic inspection for ${eq.name} at ${eq.location} is overdue. Schedule an inspection visit to maintain safety compliance.`;
      } else if (interval === 0 && inspectDiffDays === 0) {
        isMatch = true;
        reminderTitle = `🚨 DUE TODAY: Inspection for ${eq.name}`;
        reminderMessage = `Inspection is due today for ${eq.name} (${eq.equipmentId}) at ${eq.location}.`;
      } else if (interval > 0 && inspectDiffDays === interval) {
        isMatch = true;
        reminderTitle = `🔔 Inspection Due in ${interval} Days: ${eq.name}`;
        reminderMessage = `Inspection for ${eq.name} at ${eq.location} is due on ${new Date(eq.nextInspectionDate).toLocaleDateString("en-IN")} (${interval} days remaining).`;
      }

      if (isMatch) {
        const sent = await NotificationService.dispatchReminder({
          userId: eq.userId,
          recipientEmail: user.email,
          recipientPhone: user.phone,
          type: "Inspection_Reminder",
          entityId: `${eq.equipmentId}-INSPECT`,
          intervalDays: interval,
          title: reminderTitle,
          message: reminderMessage,
          link: `/my-equipment`,
        });
        if (sent) remindersDispatched++;
      }
    }
  }

  // 2. Scan AMC contracts for renewals (60, 30, 15, 0, -1 days)
  const amcIntervals = [60, 30, 15, 0, -1];
  const amcList = await AMCContract.find({ status: "Active" });
  for (const amc of amcList) {
    const liveFormB = calculateFormBStatus(amc.renewalDate);
    if (amc.formBStatus !== liveFormB) {
      amc.formBStatus = liveFormB;
      await amc.save();
    }

    const diffDays = Math.ceil(
      (new Date(amc.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const interval of amcIntervals) {
      let isMatch = false;
      let title = "";
      let msg = "";

      if (interval === -1 && diffDays < 0) {
        isMatch = true;
        title = `⚠️ AMC Contract Expired: ${amc.contractNumber}`;
        msg = `Your annual maintenance contract ${amc.contractNumber} for ${amc.clientName} has expired. Form B renewal is urgently required under Maharashtra Fire Prevention & Life Safety Act.`;
      } else if (interval === 0 && diffDays === 0) {
        isMatch = true;
        title = `🚨 AMC Renewal Due Today: ${amc.contractNumber}`;
        msg = `Your AMC contract ${amc.contractNumber} (${amc.planName}) expires today. Contact our AMC operations desk to renew.`;
      } else if (interval > 0 && diffDays === interval) {
        isMatch = true;
        title = `🔔 AMC Contract Renewal in ${interval} Days: ${amc.contractNumber}`;
        msg = `Your Fire Safety AMC contract ${amc.contractNumber} for ${amc.clientName} will renew on ${new Date(amc.renewalDate).toLocaleDateString("en-IN")} (${interval} days remaining).`;
      }

      if (isMatch) {
        const sent = await NotificationService.dispatchReminder({
          userId: amc.userId,
          recipientEmail: amc.email,
          recipientPhone: amc.phone,
          type: "AMC_Expiry_Reminder",
          entityId: amc.contractNumber,
          intervalDays: interval,
          title,
          message: msg,
          link: `/services/amc`,
        });
        if (sent) remindersDispatched++;
      }
    }
  }

  console.log(
    `[CRON] Reminder scan complete. Evaluated ${equipmentList.length} equipment, ${amcList.length} AMCs. Dispatched ${remindersDispatched} alerts.`
  );

  return {
    inspectedEquipmentCount: equipmentList.length,
    remindersDispatched,
  };
}

export function initializeReminderCron() {
  const cronSchedule = process.env.REFILL_REMINDER_CRON || "0 9 * * *"; // Default every day at 9 AM

  if (!cron.validate(cronSchedule)) {
    console.error(`[CRON] Invalid cron schedule expression: "${cronSchedule}". Defaulting to "0 9 * * *".`);
  }

  const validSchedule = cron.validate(cronSchedule) ? cronSchedule : "0 9 * * *";

  cron.schedule(validSchedule, async () => {
    try {
      await runEquipmentReminderScan();
    } catch (err) {
      console.error("[CRON] Error during scheduled reminder scan:", err);
    }
  });

  console.log(`[CRON] Equipment & AMC Reminder cron scheduled with expression: "${validSchedule}"`);
}
