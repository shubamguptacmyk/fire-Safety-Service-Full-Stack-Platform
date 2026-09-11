import { CustomerEquipment, ICustomerEquipment, calculateEquipmentStatus } from "../models/CustomerEquipment";
import { CreateEquipmentInput, UpdateEquipmentInput, EquipmentQueryInput } from "../validators/equipment.validators";
import { NotificationService } from "./notification.service";
import { Types } from "mongoose";

export class EquipmentService {
  /**
   * Register a new fire extinguisher or safety equipment item
   */
  static async createEquipment(
    userId: string | Types.ObjectId,
    data: CreateEquipmentInput
  ): Promise<ICustomerEquipment> {
    const timestamp = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const equipmentId = data.qrCode || `EQ-${timestamp}-${randomSuffix}`;

    const nextRefill = new Date(data.nextRefillDate);
    const nextInspect = new Date(data.nextInspectionDate);
    const status = calculateEquipmentStatus(nextRefill, nextInspect);

    const equipment = await CustomerEquipment.create({
      userId: new Types.ObjectId(userId.toString()),
      equipmentId,
      name: data.name,
      serialNumber: data.serialNumber.trim().toUpperCase(),
      equipmentType: data.equipmentType,
      capacity: data.capacity,
      location: data.location,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      installationDate: new Date(data.installationDate),
      lastInspectionDate: new Date(data.lastInspectionDate),
      lastRefillDate: new Date(data.lastRefillDate),
      nextInspectionDate: nextInspect,
      nextRefillDate: nextRefill,
      hydroTestDueDate: data.hydroTestDueDate ? new Date(data.hydroTestDueDate) : undefined,
      status,
      notes: data.notes,
      qrCode: equipmentId,
    });

    // Notify user of successful registration
    await NotificationService.sendInApp(
      userId,
      "Equipment Registered Successfully",
      `${equipment.name} (${equipment.equipmentId}) is now active in your safety inventory with automated compliance tracking.`,
      "equipment",
      "/my-equipment"
    );

    return equipment;
  }

  /**
   * Get user's equipment with live status re-evaluation and metrics
   */
  static async getUserEquipment(userId: string | Types.ObjectId, query: EquipmentQueryInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId.toString()),
    };

    if (query.status) {
      filter.status = query.status;
    }
    if (query.type) {
      filter.equipmentType = new RegExp(query.type, "i");
    }
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, "i") },
        { serialNumber: new RegExp(query.search, "i") },
        { equipmentId: new RegExp(query.search, "i") },
        { location: new RegExp(query.search, "i") },
      ];
    }

    const [rawItems, total, allForCounts] = await Promise.all([
      CustomerEquipment.find(filter).sort({ nextRefillDate: 1 }).skip(skip).limit(limit),
      CustomerEquipment.countDocuments(filter),
      CustomerEquipment.find({ userId: new Types.ObjectId(userId.toString()) }).select(
        "nextRefillDate nextInspectionDate status"
      ),
    ]);

    // Live update statuses if dates passed
    const items = await Promise.all(
      rawItems.map(async (item) => {
        const computed = calculateEquipmentStatus(item.nextRefillDate, item.nextInspectionDate);
        if (item.status !== computed) {
          item.status = computed;
          await item.save();
        }
        return item;
      })
    );

    // Compute live metrics across all user equipment
    let healthyCount = 0;
    let inspectionDueCount = 0;
    let refillDueCount = 0;
    let overdueCount = 0;

    for (const eq of allForCounts) {
      const live = calculateEquipmentStatus(eq.nextRefillDate, eq.nextInspectionDate);
      if (live === "Healthy") healthyCount++;
      else if (live === "Inspection Due Soon") inspectionDueCount++;
      else if (live === "Refill Due Soon") refillDueCount++;
      else if (live === "Overdue") overdueCount++;
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        total: allForCounts.length,
        healthy: healthyCount,
        inspectionDueSoon: inspectionDueCount,
        refillDueSoon: refillDueCount,
        overdue: overdueCount,
      },
    };
  }

  /**
   * Get single equipment item
   */
  static async getEquipmentById(id: string, userId?: string | Types.ObjectId, isAdmin = false) {
    const filter: Record<string, any> = { _id: id };
    if (!isAdmin && userId) {
      filter.userId = new Types.ObjectId(userId.toString());
    }

    const equipment = await CustomerEquipment.findOne(filter).populate("product", "name SKU images");
    if (equipment) {
      const computed = calculateEquipmentStatus(equipment.nextRefillDate, equipment.nextInspectionDate);
      if (equipment.status !== computed) {
        equipment.status = computed;
        await equipment.save();
      }
    }
    return equipment;
  }

  /**
   * Scan / get equipment by QR code or equipment ID
   */
  static async getEquipmentByQR(qrCode: string, userId?: string | Types.ObjectId, isAdmin = false) {
    const filter: Record<string, any> = {
      $or: [
        { qrCode },
        { equipmentId: qrCode },
        { serialNumber: qrCode.toUpperCase() },
      ],
    };
    if (!isAdmin && userId) {
      filter.userId = new Types.ObjectId(userId.toString());
    }

    const equipment = await CustomerEquipment.findOne(filter).populate("product", "name SKU images");
    if (equipment) {
      const computed = calculateEquipmentStatus(equipment.nextRefillDate, equipment.nextInspectionDate);
      if (equipment.status !== computed) {
        equipment.status = computed;
        await equipment.save();
      }
    }
    return equipment;
  }

  /**
   * Update equipment details
   */
  static async updateEquipment(
    id: string,
    userId: string | Types.ObjectId,
    data: UpdateEquipmentInput,
    isAdmin = false
  ) {
    const filter: Record<string, any> = { _id: id };
    if (!isAdmin) {
      filter.userId = new Types.ObjectId(userId.toString());
    }

    const equipment = await CustomerEquipment.findOne(filter);
    if (!equipment) return null;

    if (data.name) equipment.name = data.name;
    if (data.serialNumber) equipment.serialNumber = data.serialNumber.trim().toUpperCase();
    if (data.equipmentType) equipment.equipmentType = data.equipmentType;
    if (data.capacity !== undefined) equipment.capacity = data.capacity;
    if (data.location) equipment.location = data.location;
    if (data.purchaseDate) equipment.purchaseDate = new Date(data.purchaseDate);
    if (data.installationDate) equipment.installationDate = new Date(data.installationDate);
    if (data.lastInspectionDate) equipment.lastInspectionDate = new Date(data.lastInspectionDate);
    if (data.lastRefillDate) equipment.lastRefillDate = new Date(data.lastRefillDate);
    if (data.nextInspectionDate) equipment.nextInspectionDate = new Date(data.nextInspectionDate);
    if (data.nextRefillDate) equipment.nextRefillDate = new Date(data.nextRefillDate);
    if (data.hydroTestDueDate) equipment.hydroTestDueDate = new Date(data.hydroTestDueDate);
    if (data.notes !== undefined) equipment.notes = data.notes;
    if (data.qrCode !== undefined) equipment.qrCode = data.qrCode;

    equipment.status = calculateEquipmentStatus(equipment.nextRefillDate, equipment.nextInspectionDate);
    await equipment.save();

    return equipment;
  }

  /**
   * Delete equipment item
   */
  static async deleteEquipment(id: string, userId: string | Types.ObjectId, isAdmin = false) {
    const filter: Record<string, any> = { _id: id };
    if (!isAdmin) {
      filter.userId = new Types.ObjectId(userId.toString());
    }
    return await CustomerEquipment.findOneAndDelete(filter);
  }

  /**
   * Admin: query all registered equipment across the platform
   */
  static async getAllEquipmentAdmin(query: EquipmentQueryInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.type) {
      filter.equipmentType = new RegExp(query.type, "i");
    }
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, "i") },
        { serialNumber: new RegExp(query.search, "i") },
        { equipmentId: new RegExp(query.search, "i") },
        { location: new RegExp(query.search, "i") },
      ];
    }

    const [items, total] = await Promise.all([
      CustomerEquipment.find(filter)
        .populate("userId", "name email phone")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      CustomerEquipment.countDocuments(filter),
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
