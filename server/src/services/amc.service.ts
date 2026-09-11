import { AMCContract, IAMCContract, calculateFormBStatus } from "../models/AMCContract";
import { CreateAMCContractInput, UpdateAMCContractInput, RecordAMCVisitInput, AMCQueryInput } from "../validators/amc.validators";
import { NotificationService } from "./notification.service";
import { Types } from "mongoose";

export class AMCService {
  /**
   * Seed default demo AMC contracts if empty
   */
  static async seedDefaultAMCsIfEmpty(defaultUserId?: Types.ObjectId): Promise<void> {
    const count = await AMCContract.countDocuments();
    if (count === 0 && defaultUserId) {
      await AMCContract.create([
        {
          contractNumber: "AMC-2026-0881",
          userId: defaultUserId,
          clientName: "Turbhe Logistics Park Association",
          companyName: "Turbhe Logistics Park Ltd",
          phone: "9820123456",
          email: "facilities@turbhelogistics.com",
          premisesType: "Commercial / Warehousing",
          location: "Plot C-12, Turbhe MIDC, Navi Mumbai",
          planName: "Comprehensive Commercial AMC (Quarterly)",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
          renewalDate: new Date("2026-12-31"),
          frequency: "Quarterly",
          visitsPerYear: 4,
          visitsCompleted: 1,
          visitsScheduled: [
            {
              visitNumber: 1,
              scheduledDate: new Date("2026-03-12"),
              completedDate: new Date("2026-03-12"),
              technicianName: "Ganesh Patil",
              status: "Completed",
              notes: "Q1 Inspection completed. All 48 units verified compliant.",
            },
            {
              visitNumber: 2,
              scheduledDate: new Date("2026-06-15"),
              technicianName: "Ganesh Patil",
              status: "Pending",
              notes: "Q2 Monsoon preparedness and pressure gauge checks.",
            },
            {
              visitNumber: 3,
              scheduledDate: new Date("2026-09-15"),
              status: "Pending",
            },
            {
              visitNumber: 4,
              scheduledDate: new Date("2026-12-10"),
              status: "Pending",
            },
          ],
          formBStatus: "Current",
          formBNumber: "FORM-B/MFS/2026/0881",
          equipmentCount: 48,
          annualValue: 45000,
          status: "Active",
          notes: "Covers 3 warehouse sheds and main administrative office block.",
        },
        {
          contractNumber: "AMC-2026-0412",
          userId: defaultUserId,
          clientName: "Sagar Co-op Housing Society Ltd",
          companyName: "Sagar CHS",
          phone: "9820554433",
          email: "secretary@sagarchs.org",
          premisesType: "Residential High-Rise",
          location: "Sector 14, Palm Beach Road, Vashi, Navi Mumbai",
          planName: "Essential Safety AMC (Half-Yearly)",
          startDate: new Date("2025-04-16"),
          endDate: new Date("2026-04-15"),
          renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Due in 20 days
          frequency: "Half-Yearly",
          visitsPerYear: 2,
          visitsCompleted: 2,
          visitsScheduled: [
            {
              visitNumber: 1,
              scheduledDate: new Date("2025-10-15"),
              completedDate: new Date("2025-10-15"),
              technicianName: "Sunil Varma",
              status: "Completed",
            },
            {
              visitNumber: 2,
              scheduledDate: new Date("2026-03-20"),
              completedDate: new Date("2026-03-20"),
              technicianName: "Sunil Varma",
              status: "Completed",
            },
          ],
          formBStatus: "Due in 30 Days",
          formBNumber: "FORM-B/MFS/2025/1922",
          equipmentCount: 22,
          annualValue: 28000,
          status: "Active",
          notes: "Residential twin towers (G+18). Risers and hose reels verified.",
        },
      ]);
    }
  }

  /**
   * Create new AMC Contract
   */
  static async createAMCContract(
    data: CreateAMCContractInput,
    fallbackUserId?: string | Types.ObjectId
  ): Promise<IAMCContract> {
    const targetUserId = data.userId || fallbackUserId;
    if (!targetUserId) {
      throw new Error("Customer user ID is required to create an AMC contract");
    }

    const timestamp = Date.now().toString().slice(-4);
    const contractNumber = `AMC-${new Date().getFullYear()}-${timestamp}`;

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const renewalDate = new Date(data.renewalDate);
    const formBStatus = calculateFormBStatus(renewalDate);

    // Build schedule
    const visitsPerYear = data.frequency === "Annual" ? 1 : data.frequency === "Half-Yearly" ? 2 : 4;
    const visitsScheduled = [];
    const intervalMonths = 12 / visitsPerYear;

    for (let i = 1; i <= visitsPerYear; i++) {
      const scheduled = new Date(startDate);
      scheduled.setMonth(scheduled.getMonth() + (i - 1) * intervalMonths);
      visitsScheduled.push({
        visitNumber: i,
        scheduledDate: scheduled,
        status: "Pending" as const,
        notes: `Visit #${i} scheduled routine inspection`,
      });
    }

    const contract = await AMCContract.create({
      contractNumber,
      userId: new Types.ObjectId(targetUserId.toString()),
      clientName: data.clientName,
      companyName: data.companyName,
      phone: data.phone,
      email: data.email,
      premisesType: data.premisesType,
      location: data.location,
      planName: data.planName,
      startDate,
      endDate,
      renewalDate,
      frequency: data.frequency,
      visitsPerYear,
      visitsCompleted: 0,
      visitsScheduled,
      formBStatus,
      assignedTechnician: data.assignedTechnician ? new Types.ObjectId(data.assignedTechnician) : undefined,
      equipmentCount: data.equipmentCount,
      annualValue: data.annualValue,
      status: "Active",
      notes: data.notes,
    });

    await NotificationService.sendInApp(
      targetUserId,
      "AMC Contract Activated",
      `Your Fire Safety AMC Contract (${contractNumber}) for ${contract.clientName} has been activated.`,
      "amc",
      "/services/amc"
    );

    return contract;
  }

  /**
   * Get user's active & past AMC contracts
   */
  static async getUserAMCContracts(userId: string | Types.ObjectId) {
    const contracts = await AMCContract.find({
      userId: new Types.ObjectId(userId.toString()),
    })
      .sort({ renewalDate: 1 })
      .populate("assignedTechnician", "name phone email");

    // Live evaluate Form B status
    for (const c of contracts) {
      const live = calculateFormBStatus(c.renewalDate);
      if (c.formBStatus !== live) {
        c.formBStatus = live;
        await c.save();
      }
    }

    return contracts;
  }

  /**
   * Get single AMC contract
   */
  static async getAMCById(id: string, userId?: string | Types.ObjectId, isAdmin = false) {
    const filter: Record<string, any> = { _id: id };
    if (!isAdmin && userId) {
      filter.userId = new Types.ObjectId(userId.toString());
    }

    return await AMCContract.findOne(filter).populate("assignedTechnician", "name phone email");
  }

  /**
   * Admin: query all AMC contracts
   */
  static async getAllAMCContracts(query: AMCQueryInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.formBStatus) filter.formBStatus = query.formBStatus;
    if (query.search) {
      filter.$or = [
        { contractNumber: new RegExp(query.search, "i") },
        { clientName: new RegExp(query.search, "i") },
        { companyName: new RegExp(query.search, "i") },
        { location: new RegExp(query.search, "i") },
      ];
    }

    const [items, total] = await Promise.all([
      AMCContract.find(filter)
        .populate("userId", "name email phone")
        .populate("assignedTechnician", "name phone")
        .sort({ renewalDate: 1 })
        .skip(skip)
        .limit(limit),
      AMCContract.countDocuments(filter),
    ]);

    // Live update Form B
    for (const c of items) {
      const live = calculateFormBStatus(c.renewalDate);
      if (c.formBStatus !== live) {
        c.formBStatus = live;
        await c.save();
      }
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Update AMC contract
   */
  static async updateAMCContract(id: string, data: UpdateAMCContractInput) {
    const contract = await AMCContract.findById(id);
    if (!contract) return null;

    if (data.clientName) contract.clientName = data.clientName;
    if (data.companyName !== undefined) contract.companyName = data.companyName;
    if (data.phone) contract.phone = data.phone;
    if (data.email) contract.email = data.email;
    if (data.premisesType) contract.premisesType = data.premisesType;
    if (data.location) contract.location = data.location;
    if (data.planName) contract.planName = data.planName;
    if (data.startDate) contract.startDate = new Date(data.startDate);
    if (data.endDate) contract.endDate = new Date(data.endDate);
    if (data.renewalDate) {
      contract.renewalDate = new Date(data.renewalDate);
      contract.formBStatus = calculateFormBStatus(contract.renewalDate);
    }
    if (data.frequency) contract.frequency = data.frequency;
    if (data.assignedTechnician) contract.assignedTechnician = new Types.ObjectId(data.assignedTechnician);
    if (data.equipmentCount !== undefined) contract.equipmentCount = data.equipmentCount;
    if (data.annualValue !== undefined) contract.annualValue = data.annualValue;
    if (data.status) contract.status = data.status;
    if (data.formBStatus) contract.formBStatus = data.formBStatus;
    if (data.formBCertificateUrl !== undefined) contract.formBCertificateUrl = data.formBCertificateUrl;
    if (data.formBNumber !== undefined) contract.formBNumber = data.formBNumber;
    if (data.notes !== undefined) contract.notes = data.notes;

    await contract.save();
    return contract;
  }

  /**
   * Record completion of an AMC visit
   */
  static async recordVisit(contractId: string, data: RecordAMCVisitInput) {
    const contract = await AMCContract.findById(contractId);
    if (!contract) return null;

    const visit = contract.visitsScheduled.find((v) => v.visitNumber === data.visitNumber);
    if (!visit) {
      throw new Error(`Visit #${data.visitNumber} not found on contract`);
    }

    visit.status = data.status;
    if (data.completedDate) {
      visit.completedDate = new Date(data.completedDate);
    } else if (data.status === "Completed") {
      visit.completedDate = new Date();
    }
    if (data.notes) visit.notes = data.notes;
    if (data.technician) visit.technician = new Types.ObjectId(data.technician);

    contract.visitsCompleted = contract.visitsScheduled.filter((v) => v.status === "Completed").length;
    await contract.save();

    return contract;
  }
}
