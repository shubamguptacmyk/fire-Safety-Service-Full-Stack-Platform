import { Technician, ITechnician, TechnicianStatus } from "../models/Technician";
import { CreateTechnicianInput, UpdateTechnicianInput } from "../validators/technician.validators";
import { Types } from "mongoose";

export class TechnicianService {
  /**
   * Seed default licensed technicians if database is empty
   */
  static async seedDefaultTechniciansIfEmpty(): Promise<void> {
    const count = await Technician.countDocuments();
    if (count === 0) {
      await Technician.create([
        {
          name: "Ganesh Patil",
          phone: "9820123456",
          email: "ganesh.patil@akfiresafety.com",
          employeeId: "TECH-001",
          skills: [
            "Extinguisher Refilling",
            "Hydro-Testing",
            "Quarterly Inspection",
            "Hose Reel Servicing",
          ],
          serviceArea: "Navi Mumbai (Turbhe, Vashi, Rabale, Nerul)",
          status: "active",
          licenseNumber: "MFS-TECH-0491",
          rating: 4.9,
          activeJobsCount: 1,
          completedJobsCount: 142,
          notes: "Grade I Certified Fire Safety Technician. Specialist in pressure vessels.",
        },
        {
          name: "Mahesh Kulkarni",
          phone: "9820987654",
          email: "mahesh.k@akfiresafety.com",
          employeeId: "TECH-002",
          skills: [
            "Pressure Vessel Hydro-Testing",
            "CO2 System Recharge",
            "Suppression Flooding Test",
          ],
          serviceArea: "Navi Mumbai & Thane Industrial Belt",
          status: "active",
          licenseNumber: "PESO-TEST-1102",
          rating: 4.8,
          activeJobsCount: 1,
          completedJobsCount: 98,
          notes: "PESO certified pressure vessel tester and gas cylinder specialist.",
        },
        {
          name: "Sunil Varma",
          phone: "9820554433",
          email: "sunil.varma@akfiresafety.com",
          employeeId: "TECH-003",
          skills: [
            "Fire Safety Audit",
            "Form B Compliance Inspection",
            "Alarm Panel Diagnostics",
            "Hydrant Ring Testing",
          ],
          serviceArea: "MMR (Navi Mumbai, Mumbai, Panvel)",
          status: "active",
          licenseNumber: "MFS-AUD-0038",
          rating: 4.9,
          activeJobsCount: 0,
          completedJobsCount: 215,
          notes: "Maharashtra Fire Services licensed auditor and electrical safety inspector.",
        },
      ]);
    }
  }

  /**
   * Get all technicians with optional status/area filters
   */
  static async getAllTechnicians(filter: {
    status?: TechnicianStatus;
    search?: string;
    area?: string;
  } = {}) {
    await this.seedDefaultTechniciansIfEmpty();

    const query: Record<string, any> = {};
    if (filter.status) query.status = filter.status;
    if (filter.area) query.serviceArea = new RegExp(filter.area, "i");
    if (filter.search) {
      query.$or = [
        { name: new RegExp(filter.search, "i") },
        { employeeId: new RegExp(filter.search, "i") },
        { phone: new RegExp(filter.search, "i") },
      ];
    }

    return await Technician.find(query).sort({ rating: -1, name: 1 });
  }

  /**
   * Get single technician by ID
   */
  static async getTechnicianById(id: string | Types.ObjectId): Promise<ITechnician | null> {
    return await Technician.findById(id);
  }

  /**
   * Create technician
   */
  static async createTechnician(data: CreateTechnicianInput): Promise<ITechnician> {
    return await Technician.create({
      ...data,
      employeeId: data.employeeId.toUpperCase(),
    });
  }

  /**
   * Update technician
   */
  static async updateTechnician(
    id: string | Types.ObjectId,
    data: UpdateTechnicianInput
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Adjust active job counter
   */
  static async adjustJobCount(id: string | Types.ObjectId, deltaActive: number, deltaCompleted = 0) {
    return await Technician.findByIdAndUpdate(
      id,
      {
        $inc: {
          activeJobsCount: deltaActive,
          completedJobsCount: deltaCompleted,
        },
      },
      { new: true }
    );
  }

  static async deleteTechnician(id: string | Types.ObjectId) {
    return await Technician.findByIdAndDelete(id);
  }

  static async getMyJobs(techId: string | Types.ObjectId) {
    const { ServiceBooking } = await import("../models/ServiceBooking");
    return await ServiceBooking.find({ assignedTechnician: techId }).sort({ preferredDate: 1 });
  }

  static async updateJobStatus(bookingId: string, status: any, notes?: string, techUserId?: string) {
    const { ServiceBooking } = await import("../models/ServiceBooking");
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    booking.status = status;
    booking.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: techUserId ? new Types.ObjectId(techUserId) : undefined,
      notes: notes || `Status updated by technician to ${status}`,
    });

    if (status === "Completed") {
      await this.adjustJobCount(booking.assignedTechnician!, -1, 1);
    }
    await booking.save();
    return booking;
  }

  static async addJobPhotos(bookingId: string, photos: Array<{ url: string; caption?: string; phase: "before" | "after" | "testing" }>) {
    const { ServiceBooking } = await import("../models/ServiceBooking");
    return await ServiceBooking.findByIdAndUpdate(
      bookingId,
      { $push: { photographs: { $each: photos } } },
      { new: true }
    );
  }

  static async addJobNotes(bookingId: string, notes: string, techUserId?: string) {
    const { ServiceBooking } = await import("../models/ServiceBooking");
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    booking.statusHistory.push({
      status: booking.status,
      changedAt: new Date(),
      changedBy: techUserId ? new Types.ObjectId(techUserId) : undefined,
      notes,
    });
    await booking.save();
    return booking;
  }
}
