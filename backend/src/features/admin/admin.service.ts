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

function hasPendingProfileUpdates(specialist: InstanceType<typeof MedicalSpecialist>) {
  if (!specialist.pendingProfileUpdates) return false;
  return Object.values(specialist.pendingProfileUpdates).some((value) => value !== undefined);
}

function recalculateVerificationStatus(specialist: InstanceType<typeof MedicalSpecialist>) {
  const hasPendingCerts =
    specialist.certifications?.some((cert) => cert.status === "pending") ?? false;

  if (hasPendingCerts || hasPendingProfileUpdates(specialist)) {
    specialist.verificationStatus = "pending";
    return;
  }

  const registrationRejected = specialist.certifications?.some(
    (cert) => cert.isRegistrationCert && cert.status === "rejected",
  );

  if (registrationRejected) {
    specialist.verificationStatus = "rejected";
    specialist.revertToApprovedOnReject = false;
    return;
  }

  specialist.verificationStatus = "approved";
  specialist.revertToApprovedOnReject = false;
}

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

    if (specialist.certifications?.length) {
      for (const cert of specialist.certifications) {
        if (cert.status === "pending") {
          cert.status = "approved";
          cert.isNewAddition = false;
        }
      }
    }

    specialist.verificationStatus = "approved";
    specialist.revertToApprovedOnReject = false;

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

      if (specialist.certifications?.length) {
        specialist.certifications = specialist.certifications.filter(
          (cert) => !(cert.status === "pending" && cert.isNewAddition),
        );

        for (const cert of specialist.certifications) {
          if (cert.status === "pending" && !cert.isNewAddition) {
            cert.status = "rejected";
          }
        }
      }

      recalculateVerificationStatus(specialist);
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

  static async approveCertificate(specialistId: string, certId: string) {
    const specialist = await MedicalSpecialist.findById(specialistId);

    if (!specialist) {
      throw new Error("Medical specialist not found");
    }

    const cert = specialist.certifications?.id(certId);
    if (!cert) {
      throw new Error("Certificate not found");
    }

    if (cert.status !== "pending") {
      throw new Error("Certificate is not pending review");
    }

    cert.status = "approved";
    cert.isNewAddition = false;

    if (specialist.pendingProfileUpdates) {
      applyPendingProfileUpdates(specialist, specialist.pendingProfileUpdates);
      specialist.pendingProfileUpdates = undefined;
    }

    recalculateVerificationStatus(specialist);

    await specialist.save();
    return specialist.populate("userId", "name email phone address photoUrl");
  }

  static async rejectCertificate(specialistId: string, certId: string) {
    const specialist = await MedicalSpecialist.findById(specialistId);

    if (!specialist) {
      throw new Error("Medical specialist not found");
    }

    const cert = specialist.certifications?.id(certId);
    if (!cert) {
      throw new Error("Certificate not found");
    }

    if (cert.status !== "pending") {
      throw new Error("Certificate is not pending review");
    }

    const isRegistration = cert.isRegistrationCert;

    if (cert.isNewAddition) {
      cert.deleteOne();
    } else {
      cert.status = "rejected";
      cert.isNewAddition = false;
    }

    if (isRegistration) {
      specialist.verificationStatus = "rejected";
      specialist.revertToApprovedOnReject = false;
    } else {
      recalculateVerificationStatus(specialist);
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
