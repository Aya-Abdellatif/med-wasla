import User from "../../models/user.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";

export class AdminService {
  static async getPendingSpecialists() {
    return MedicalSpecialist.find({ verificationStatus: "pending" }).populate(
      "userId",
      "name email phone address photoUrl",
    );
  }

  static async approveSpecialist(specialistId: string) {
    const specialist = await MedicalSpecialist.findById(specialistId);

    if (!specialist) {
      throw new Error("Medical specialist not found");
    }

    specialist.verificationStatus = "approved";
    if (specialist.certifications?.length) {
      for (const cert of specialist.certifications) {
        cert.status = "approved";
      }
    }

    await specialist.save();
    return specialist.populate("userId", "name email phone address photoUrl");
  }

  static async rejectSpecialist(specialistId: string) {
    const specialist = await MedicalSpecialist.findById(specialistId);

    if (!specialist) {
      throw new Error("Medical specialist not found");
    }

    specialist.verificationStatus = "rejected";
    if (specialist.certifications?.length) {
      for (const cert of specialist.certifications) {
        cert.status = "rejected";
      }
    }

    await specialist.save();
    return specialist.populate("userId", "name email phone address photoUrl");
  }

  static async getAllSpecialists() {
    return MedicalSpecialist.find({}).populate(
      "userId",
      "name email phone address photoUrl",
    );
  }
}
