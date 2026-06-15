// backend/src/features/medicalSpecialist/Doctors/specialists.service.ts
import MedicalSpecialist from "../../../models/medicalSpecialist.model.js";

export class SpecialistsService {
  static async getProfile(userId: string) {
    return MedicalSpecialist.findOne({ userId }).populate("userId", "name email phone address photoUrl");
  }

  static async updateProfile(userId: string, updateData: any) {
    // أي تحديث بيرجع الحالة لـ pending
    return MedicalSpecialist.findOneAndUpdate(
      { userId },
      { 
        ...updateData, 
        verificationStatus: "pending" 
      },
      { new: true, runValidators: true }
    ).populate("userId", "name email phone address photoUrl");
  }

  static async addCertificate(userId: string, certificate: any) {
    return MedicalSpecialist.findOneAndUpdate(
      { userId },
      { 
        $push: { certifications: certificate },
        $set: { verificationStatus: "pending" }
      },
      { new: true }
    );
  }
}