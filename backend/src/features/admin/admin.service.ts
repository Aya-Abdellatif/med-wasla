import MedicalSpecialist, {
  type IPendingProfileUpdates,
} from "../../models/medicalSpecialist.model.js";

const applyPendingProfileUpdates = (
  specialist: InstanceType<typeof MedicalSpecialist>,
  pending: IPendingProfileUpdates,
) => {
  for (const [field, value] of Object.entries(pending)) {
    if (value !== undefined) {
      Reflect.set(specialist, field, value);
    }
  }
};

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

    if (specialist.pendingProfileUpdates) {
      applyPendingProfileUpdates(specialist, specialist.pendingProfileUpdates);
      specialist.pendingProfileUpdates = undefined;
    }

    specialist.verificationStatus = "approved";
    specialist.revertToApprovedOnReject = false;

    if (specialist.certifications?.length) {
      for (const cert of specialist.certifications) {
        if (cert.status === "pending") {
          cert.status = "approved";
        }
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

    if (specialist.revertToApprovedOnReject) {
      specialist.pendingProfileUpdates = undefined;
      specialist.revertToApprovedOnReject = false;
      specialist.verificationStatus = "approved";

      if (specialist.certifications?.length) {
        specialist.certifications = specialist.certifications.filter(
          (cert) => cert.status !== "pending",
        );
      }
    } else {
      specialist.verificationStatus = "rejected";

      if (specialist.certifications?.length) {
        for (const cert of specialist.certifications) {
          if (cert.status === "pending") {
            cert.status = "rejected";
          }
        }
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
