import MedicalSpecialist, {} from "../../../models/medicalSpecialist.model.js";
// ─── Service Functions ────────────────────────────────────────────────────────
export const getAllSpecialistsService = async (query) => {
    const { specialistType, specialization, verificationStatus, homeVisit, serviceArea, search, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", } = query;
    //   const filter: FilterQuery<typeof MedicalSpecialist> = {};
    const filter = {};
    if (specialistType)
        filter.specialistType = specialistType;
    if (specialization)
        filter.specialization = specialization;
    if (verificationStatus)
        filter.verificationStatus = verificationStatus;
    if (homeVisit !== undefined)
        filter.homeVisit = homeVisit === "true";
    if (serviceArea)
        filter.serviceAreas = { $in: [serviceArea] };
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
    const sort = {
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
export const getSpecialistByIdService = async (id) => {
    const specialist = await MedicalSpecialist.findById(id)
        .populate("userId", "firstName lastName profilePicture email phone")
        .lean();
    if (!specialist)
        throw new Error("Specialist not found");
    return specialist;
};
export const getSpecialistsBySpecializationService = async (name) => {
    const specialists = await MedicalSpecialist.find({
        specialization: { $regex: name, $options: "i" },
        verificationStatus: "approved",
    })
        .populate("userId", "firstName lastName profilePicture email")
        .lean();
    return specialists;
};
export const updateSpecialistProfileService = async (userId, body) => {
    const allowedFields = [
        "bio",
        "clinicAddress",
        "areasOfExpertise",
        "avgWaitMinutes",
        "serviceAreas",
        "homeVisit",
    ];
    const updateData = {};
    for (const field of allowedFields) {
        if (body[field] !== undefined)
            updateData[field] = body[field];
    }
    const specialist = await MedicalSpecialist.findOneAndUpdate({ userId }, { $set: updateData }, { new: true, runValidators: true }).populate("userId", "firstName lastName profilePicture email");
    if (!specialist)
        throw new Error("Specialist profile not found");
    return specialist;
};
export const updateAvailabilityService = async (userId, body) => {
    const { availableSlots } = body;
    if (!Array.isArray(availableSlots)) {
        throw new Error("availableSlots must be an array");
    }
    for (const slot of availableSlots) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
            throw new Error("Each slot must have day, startTime, and endTime");
        }
    }
    const specialist = await MedicalSpecialist.findOneAndUpdate({ userId }, { $set: { availableSlots } }, { new: true, runValidators: true });
    if (!specialist)
        throw new Error("Specialist profile not found");
    return specialist;
};
export const updateFeesService = async (userId, body) => {
    const { consultationFee } = body;
    if (typeof consultationFee !== "number" || consultationFee < 0) {
        throw new Error("consultationFee must be a non-negative number");
    }
    const specialist = await MedicalSpecialist.findOneAndUpdate({ userId }, { $set: { consultationFee } }, { new: true });
    if (!specialist)
        throw new Error("Specialist profile not found");
    return specialist;
};
export class SpecialistsService {
    static async getProfile(userId) {
        return MedicalSpecialist.findOne({ userId }).populate("userId", "name email phone address photoUrl");
    }
    static async updateProfile(userId, updateData) {
        // أي تحديث بيرجع الحالة لـ pending
        return MedicalSpecialist.findOneAndUpdate({ userId }, {
            ...updateData,
            verificationStatus: "pending"
        }, { new: true, runValidators: true }).populate("userId", "name email phone address photoUrl");
    }
    static async addCertificate(userId, certificate) {
        return MedicalSpecialist.findOneAndUpdate({ userId }, {
            $push: { certifications: certificate },
            $set: { verificationStatus: "pending" }
        }, { new: true });
    }
}
//# sourceMappingURL=specialists.service.js.map