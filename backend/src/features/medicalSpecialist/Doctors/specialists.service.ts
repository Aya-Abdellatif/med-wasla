import MedicalSpecialist, {
  type IAvailableSlot,
} from "../../../models/medicalSpecialist.model.js";
// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetAllSpecialistsQuery {
  specialistType?: string;
  specialization?: string;
  verificationStatus?: string;
  homeVisit?: string;
  serviceArea?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateProfileBody {
  bio?: string;
  clinicAddress?: string;
  areasOfExpertise?: string[];
  avgWaitMinutes?: number;
  serviceAreas?: string[];
  homeVisit?: boolean;
}

export interface UpdateAvailabilityBody {
  availableSlots: IAvailableSlot[];
}

export interface UpdateFeesBody {
  consultationFee: number;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export const getAllSpecialistsService = async (
  query: GetAllSpecialistsQuery,
) => {
  const {
    specialistType,
    specialization,
    verificationStatus,
    homeVisit,
    serviceArea,
    search,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  //   const filter: FilterQuery<typeof MedicalSpecialist> = {};
  const filter: any = {};

  if (specialistType) filter.specialistType = specialistType;
  if (specialization) filter.specialization = specialization;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (homeVisit !== undefined) filter.homeVisit = homeVisit === "true";
  if (serviceArea) filter.serviceAreas = { $in: [serviceArea] };

  // Search across bio, clinicAddress, areasOfExpertise
  if (search) {
    filter.$or = [
      { bio: { $regex: search, $options: "i" } },
      { clinicAddress: { $regex: search, $options: "i" } },
      { areasOfExpertise: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [specialists, total] = await Promise.all([
    MedicalSpecialist.find(filter)
      .populate("userId", "firstName lastName profilePicture email")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MedicalSpecialist.countDocuments(filter),
  ]);

  return {
    specialists,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getSpecialistByIdService = async (id: string) => {
  const specialist = await MedicalSpecialist.findById(id)
    .populate("userId", "firstName lastName profilePicture email phone")
    .lean();

  if (!specialist) throw new Error("Specialist not found");
  return specialist;
};

export const getSpecialistsBySpecializationService = async (name: string) => {
  const specialists = await MedicalSpecialist.find({
    specialization: { $regex: name, $options: "i" },
    verificationStatus: "approved",
  })
    .populate("userId", "firstName lastName profilePicture email")
    .lean();

  return specialists;
};

export const updateSpecialistProfileService = async (
  userId: string,
  body: UpdateProfileBody,
) => {
  const allowedFields: (keyof UpdateProfileBody)[] = [
    "bio",
    "clinicAddress",
    "areasOfExpertise",
    "avgWaitMinutes",
    "serviceAreas",
    "homeVisit",
  ];

  const updateData: Partial<UpdateProfileBody> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field] as any;
  }

  const specialist = await MedicalSpecialist.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { returnDocument: 'after', runValidators: true },
  ).populate("userId", "firstName lastName profilePicture email");

  if (!specialist) throw new Error("Specialist profile not found");
  return specialist;
};

export const updateAvailabilityService = async (
  userId: string,
  body: UpdateAvailabilityBody,
) => {
  const { availableSlots } = body;

  if (!Array.isArray(availableSlots)) {
    throw new Error("availableSlots must be an array");
  }

  for (const slot of availableSlots) {
    if (!slot.day || !slot.startTime || !slot.endTime) {
      throw new Error("Each slot must have day, startTime, and endTime");
    }
  }

  const specialist = await MedicalSpecialist.findOneAndUpdate(
    { userId },
    { $set: { availableSlots } },
    { returnDocument: 'after', runValidators: true },
  );

  if (!specialist) throw new Error("Specialist profile not found");
  return specialist;
};

export const updateFeesService = async (
  userId: string,
  body: UpdateFeesBody,
) => {
  const { consultationFee } = body;

  if (typeof consultationFee !== "number" || consultationFee < 0) {
    throw new Error("consultationFee must be a non-negative number");
  }

  const specialist = await MedicalSpecialist.findOneAndUpdate(
    { userId },
    { $set: { consultationFee } },
    { returnDocument: 'after'},
  );

  if (!specialist) throw new Error("Specialist profile not found");
  return specialist;
};
