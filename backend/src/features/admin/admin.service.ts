import User from "../../models/user.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";

export class AdminService {
  /**
   * Retrieves all specialists with a pending verification status.
   * Populates the related User document with specific fields.
   */
  static async getPendingSpecialists() {
    return MedicalSpecialist.find({ verificationStatus: "pending" })
      .populate("userId", "name email phone address photoUrl");
  }

  /**
   * Approves a specialist by updating their verificationStatus to approved.
   */
  static async approveSpecialist(specialistId: string) {
    const specialist = await MedicalSpecialist.findByIdAndUpdate(
      specialistId,
      { verificationStatus: "approved" },
      { new: true }
    ).populate("userId", "name email phone address photoUrl");

    if (!specialist) {
      throw new Error("Medical specialist not found");
    }

    return specialist;
  }

  /**
   * Rejects a specialist by updating their verificationStatus to rejected.
   */
  static async rejectSpecialist(specialistId: string) {
    const specialist = await MedicalSpecialist.findByIdAndUpdate(
      specialistId,
      { verificationStatus: "rejected" },
      { new: true }
    ).populate("userId", "name email phone address photoUrl");

    if (!specialist) {
      throw new Error("Medical specialist not found");
    }

    return specialist;
  }
  // داخل backend/src/features/admin/admin.service.ts
static async getAllSpecialists() {
  return MedicalSpecialist.find({}).populate("userId", "name email phone address photoUrl");
}
}

