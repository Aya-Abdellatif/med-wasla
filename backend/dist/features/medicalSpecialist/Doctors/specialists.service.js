// backend/src/features/medicalSpecialist/Doctors/specialists.service.ts
import MedicalSpecialist from "../../../models/medicalSpecialist.model.js";
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