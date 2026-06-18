import MedicalSpecialist, {
  type IAvailableSlot,
  type IMedicalSpecialist,
  type IPendingProfileUpdates,
} from "../../models/medicalSpecialist.model.js";
import User, { type IUser } from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";
import cloudinary from "../../config/cloudinary.js";

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
  specialization?: string;
  areasOfExpertise?: string[];
  avgWaitMinutes?: number;
  serviceAreas?: string[];
  homeVisit?: boolean;
}

export interface ProfileUpdateResult {
  updatedFields: IPendingProfileUpdates;
  verificationStatus: IMedicalSpecialist["verificationStatus"];
  pendingProfileUpdates?: IPendingProfileUpdates;
}

const PROFILE_UPDATE_FIELDS: (keyof UpdateProfileBody)[] = [
  "bio",
  "clinicAddress",
  "specialization",
  "areasOfExpertise",
  "avgWaitMinutes",
  "serviceAreas",
  "homeVisit",
];

const valuesEqual = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const pickChangedProfileFields = (
  body: UpdateProfileBody,
  current: Pick<IMedicalSpecialist, (typeof PROFILE_UPDATE_FIELDS)[number]>,
): IPendingProfileUpdates => {
  const changed: IPendingProfileUpdates = {};

  for (const field of PROFILE_UPDATE_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (!valuesEqual(value, current[field])) {
      Reflect.set(changed, field, value);
    }
  }

  return changed;
};

const mergePendingProfileUpdates = (
  existing: IPendingProfileUpdates | undefined,
  changed: IPendingProfileUpdates,
): IPendingProfileUpdates => ({
  ...(existing ?? {}),
  ...changed,
});

export interface UpdateAvailabilityBody {
  availableSlots: IAvailableSlot[];
}

export interface UpdateFeesBody {
  consultationFee: number;
}

export interface AddCertificateBody {
  title: string;
  issuedBy: string;
  issuedAt?: string | Date;
  certificateUrl: string;
}

export const getAllSpecialistsService = async (
  query: GetAllSpecialistsQuery,
  options: { publicOnly?: boolean } = {},
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

  const filter: Record<string, unknown> = {};

  if (specialistType) filter.specialistType = specialistType;
  if (specialization) filter.specialization = specialization;
  if (options.publicOnly) {
    filter.verificationStatus = "approved";
  } else if (verificationStatus) {
    filter.verificationStatus = verificationStatus;
  }
  if (homeVisit !== undefined) filter.homeVisit = homeVisit === "true";
  if (serviceArea) filter.serviceAreas = { $in: [serviceArea] };

  if (search) {
    const searchTerm = search.trim();
  
    const matchingUsers = await User.find({
      name: { $regex: searchTerm, $options: "i" },
    }).select("_id");
  
    const userIds = matchingUsers.map((user) => user._id);
  
    filter.$or = [
      { bio: { $regex: searchTerm, $options: "i" } },
      { clinicAddress: { $regex: searchTerm, $options: "i" } },
      { areasOfExpertise: { $regex: searchTerm, $options: "i" } },
      { specialization: { $regex: searchTerm, $options: "i" } },
      ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
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
      .populate("userId", "name email phone address photoUrl governorate")
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

export const getSpecialistByIdService = async (
  id: string,
  options: { publicOnly?: boolean } = {},
) => {
  const specialist = await MedicalSpecialist.findById(id)
    .populate("userId", "name email phone address photoUrl governorate")
    .lean();

  if (!specialist) throw new Error("Specialist not found");

  if (options.publicOnly && specialist.verificationStatus !== "approved") {
    throw new Error("Specialist not found");
  }

  return specialist;
};
export const getSpecialistsBySpecializationService = async (name: string) => {
  const specialists = await MedicalSpecialist.find({
    specialization: { $regex: name, $options: "i" },
    verificationStatus: "approved",
  })
    .populate("userId", "name email phone address photoUrl governorate")
    .lean();

  return specialists;
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
    { returnDocument: "after", runValidators: true },
  );

  if (!specialist) throw new Error("Specialist profile not found");
  return { availableSlots: specialist.availableSlots ?? [] };
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
    { returnDocument: "after", runValidators: true },
  );

  if (!specialist) throw new Error("Specialist profile not found");
  return specialist;
};

export const getSpecialistProfileService = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const specialist = await MedicalSpecialist.findOne({ userId }).populate(
    "userId",
    "name email phone address photoUrl governorate",
  );

  if (!specialist) {
    throw new Error("Specialist profile not found");
  }

  return specialist;
};

export const updateSpecialistProfileService = async (
  userId: string,
  body: UpdateProfileBody,
): Promise<ProfileUpdateResult> => {
  const specialist = await MedicalSpecialist.findOne({ userId });

  if (!specialist) throw new Error("Specialist profile not found");

  const changedFields = pickChangedProfileFields(body, specialist);

  if (Object.keys(changedFields).length === 0) {
    throw new Error("No profile changes to submit");
  }

  const wasApproved = specialist.verificationStatus === "approved";

  if (wasApproved) {
    const pendingProfileUpdates = mergePendingProfileUpdates(
      specialist.pendingProfileUpdates,
      changedFields,
    );

    specialist.pendingProfileUpdates = pendingProfileUpdates;
    specialist.revertToApprovedOnReject = true;
    specialist.verificationStatus = "pending";
    await specialist.save();

    return {
      updatedFields: changedFields,
      verificationStatus: specialist.verificationStatus,
      pendingProfileUpdates,
    };
  }

  for (const field of PROFILE_UPDATE_FIELDS) {
    const value = changedFields[field as keyof IPendingProfileUpdates];
    if (value !== undefined) {
      Reflect.set(specialist, field, value);
    }
  }

  specialist.verificationStatus = "pending";
  specialist.pendingProfileUpdates = undefined;
  specialist.revertToApprovedOnReject = false;
  await specialist.save();

  return {
    updatedFields: changedFields,
    verificationStatus: specialist.verificationStatus,
  };
};

export const addSpecialistCertificateService = async (
  userId: string,
  certificate: AddCertificateBody,
) => {
  if (!userId) throw new Error("User ID is required");

  const specialist = await MedicalSpecialist.findOne({ userId });
  if (!specialist) throw new Error("Specialist profile not found");

  const wasApproved = specialist.verificationStatus === "approved";
  const newCertificate = {
    ...certificate,
    issuedAt: certificate.issuedAt ? new Date(certificate.issuedAt) : undefined,
    status: "pending" as const,
  };

  specialist.certifications = [...(specialist.certifications ?? []), newCertificate];
  specialist.verificationStatus = "pending";
  if (wasApproved) {
    specialist.revertToApprovedOnReject = true;
  }

  await specialist.save();

  return {
    certificate: newCertificate,
    verificationStatus: specialist.verificationStatus,
  };
};

export const updateUserPhoto = async (
  userId: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<IUser> => {
  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "medwasla/profiles",
          resource_type: "image",
          format: mimeType.split("/")[1],
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        },
        (err, result) => {
          if (err || !result) {
            return reject(err ?? new Error("Cloudinary upload failed"));
          }
          resolve(result);
        },
      )
      .end(fileBuffer);
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { photoUrl: uploadResult.secure_url },
    { new: true },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
