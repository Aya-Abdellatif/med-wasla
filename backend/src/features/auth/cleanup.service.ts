import User from "../../models/user.model.js";
import Patient from "../../models/patient.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import OTP from "../../models/otp.model.js";

const UNVERIFIED_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function cleanupUnverifiedUsers(): Promise<void> {
  const cutoff = new Date(Date.now() - UNVERIFIED_TTL_MS);

  const staleUsers = await User.find(
    { isVerified: false, createdAt: { $lt: cutoff } },
    { _id: 1, email: 1, role: 1 },
  ).lean();

  if (staleUsers.length === 0) return;

  const ids = staleUsers.map((u) => u._id);
  const emails = staleUsers.map((u) => u.email);

  await Promise.all([
    Patient.deleteMany({ userId: { $in: ids } }),
    MedicalSpecialist.deleteMany({ userId: { $in: ids } }),
    OTP.deleteMany({ email: { $in: emails } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);

  console.log(`[Cleanup] Deleted ${staleUsers.length} unverified account(s) older than 24h`);
}
