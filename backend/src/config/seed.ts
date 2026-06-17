import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import MedicalSpecialist from "../models/medicalSpecialist.model.js";

dotenv.config();
if (!process.env.DATABASE_CONNECTION_STRING) {
  dotenv.config({ path: "env" });
}

const dbUri = process.env.DATABASE_CONNECTION_STRING;

const SPECIALIZATIONS = [
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Psychiatry",
  "Gynecology",
  "ENT",
  "Ophthalmology",
  "General Practice",
  "Urology",
  "Oncology",
] as const;

const DOCTORS_BY_SPECIALTY: Record<(typeof SPECIALIZATIONS)[number], [string, string, string]> = {
  Cardiology: ["Dr. Khaled Selim", "Dr. Ahmed Hassan", "Dr. Omar Farid"],
  Orthopedics: ["Dr. Samir El-Masry", "Dr. Karim Nabil", "Dr. Hani Mostafa"],
  Dermatology: ["Dr. Mona Youssef", "Dr. Nadia Kamal", "Dr. Rana Adel"],
  Pediatrics: ["Dr. Salma Fathy", "Dr. Yasmine Ali", "Dr. Heba Mahmoud"],
  Neurology: ["Dr. Tarek Sobhy", "Dr. Amr Galal", "Dr. Sherif Anwar"],
  Psychiatry: ["Dr. Dina Rashad", "Dr. Laila Hosny", "Dr. Mariam Saeed"],
  Gynecology: ["Dr. Noha Ibrahim", "Dr. Reem Ashraf", "Dr. Hala Zaki"],
  ENT: ["Dr. Mahmoud Farouk", "Dr. Bassem Nader", "Dr. Wael Emad"],
  Ophthalmology: ["Dr. Eman Lotfy", "Dr. Ghada Samir", "Dr. Inas Hany"],
  "General Practice": ["Dr. Mena Samy", "Dr. Karim Fawzy", "Dr. Ali Reda"],
  Urology: ["Dr. Hossam Kamal", "Dr. Youssef Nabil", "Dr. Ramy Saad"],
  Oncology: ["Dr. Amira Taha", "Dr. Nourhan Magdy", "Dr. Sama Osama"],
};

const NURSE_CATEGORIES = [
  { expertise: "Home Care", serviceAreas: ["Giza", "Dokki", "Mohandessin"] },
  { expertise: "Pediatric", serviceAreas: ["Cairo", "Nasr City", "Heliopolis"] },
  { expertise: "Geriatric", serviceAreas: ["Giza", "Haram", "Faisal"] },
  { expertise: "Wound Care", serviceAreas: ["Cairo", "Maadi", "Zamalek"] },
  { expertise: "IV Therapy", serviceAreas: ["Alexandria", "Smouha", "Stanley"] },
  { expertise: "Post-Op Care", serviceAreas: ["Giza", "6th October", "Sheikh Zayed"] },
] as const;

const NURSE_NAMES = [
  ["Nurse Salma Mourad", "Nurse Aya Mahmoud", "Nurse Nour Hassan"],
  ["Nurse Mariam Ali", "Nurse Dina Farid", "Nurse Hana Sobhy"],
  ["Nurse Fatma Nabil", "Nurse Samira Kamal", "Nurse Amal Reda"],
  ["Nurse Rania Emad", "Nurse Yara Lotfy", "Nurse Passant Adel"],
  ["Nurse Nada Sherif", "Nurse Malak Tarek", "Nurse Jana Hossam"],
  ["Nurse Layla Anwar", "Nurse Habiba Saeed", "Nurse Zeina Galal"],
];

const ADDRESSES = ["Cairo", "Giza", "Alexandria"] as const;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

if (!dbUri) {
  console.error("Error: DATABASE_CONNECTION_STRING is not defined in environment variables.");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB.");

    console.log("Clearing existing users and specialists...");
    await User.deleteMany({});
    await MedicalSpecialist.deleteMany({});
    await Patient.deleteMany({});
    console.log("Existing data cleared.");

    console.log("Creating Admin account...");
    await new User({
      name: "Admin MedWasla",
      email: "admin@medwasla.com",
      password: "adminpassword123",
      phone: "01000000001",
      governorate: "Cairo",
      address: "Cairo",
      dob: new Date("1985-01-15"),
      role: "admin",
      isVerified: true,
    }).save();

    console.log("Creating Patient account...");
    const patientUser = await new User({
      name: "Ahmed Ali",
      email: "ahmed.patient@gmail.com",
      password: "patientpassword123",
      phone: "01123456789",
      governorate: "Giza",
      address: "Giza",
      dob: new Date("1995-06-20"),
      role: "patient",
      isVerified: true,
    }).save();
    await Patient.create({ userId: patientUser._id });

    console.log("Creating approved doctors (3 per specialty)...");
    let doctorIndex = 0;
    for (const specialization of SPECIALIZATIONS) {
      const names = DOCTORS_BY_SPECIALTY[specialization];
      for (let i = 0; i < names.length; i++) {
        doctorIndex += 1;
        const name = names[i];
        const slug = slugify(specialization);
        const email = `doctor.${slug}.${i + 1}@medwasla.com`;
        const governorate = ADDRESSES[doctorIndex % ADDRESSES.length];

        const user = await new User({
          name,
          email,
          password: "doctorpassword123",
          phone: `0120000${String(doctorIndex).padStart(4, "0")}`,
          governorate,
          address: governorate,
          dob: new Date(`198${i}-0${(doctorIndex % 9) + 1}-15`),
          role: "specialist",
          isVerified: true,
        }).save();

        await MedicalSpecialist.create({
          userId: user._id,
          specialistType: "doctor",
          specialization,
          clinicAddress: `${10 + i} ${specialization} Clinic, ${governorate}`,
          homeVisit: i === 2,
          licenseNumber: `DOC-${slug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(3, "0")}`,
          bio: `${name} is an experienced ${specialization.toLowerCase()} specialist providing quality patient care.`,
          consultationFee: 250 + i * 50,
          avgWaitMinutes: 10 + i * 5,
          rating: 4.5 + i * 0.1,
          reviewCount: 10 + doctorIndex,
          verificationStatus: "approved",
          availableSlots: [
            { day: DAYS[i % DAYS.length], startTime: "09:00", endTime: "13:00" },
            { day: DAYS[(i + 2) % DAYS.length], startTime: "14:00", endTime: "18:00" },
          ],
          certifications: [
            {
              title: `MD in ${specialization}`,
              issuedBy: `${governorate} University`,
              issuedAt: new Date("2012-06-15"),
              certificateUrl: `https://example.com/certs/${slug}-${i + 1}.pdf`,
              status: "approved",
            },
          ],
        });
      }
    }

    console.log("Creating approved nurses (3 per category)...");
    let nurseIndex = 0;
    for (let categoryIndex = 0; categoryIndex < NURSE_CATEGORIES.length; categoryIndex++) {
      const category = NURSE_CATEGORIES[categoryIndex];
      const names = NURSE_NAMES[categoryIndex];

      for (let i = 0; i < names.length; i++) {
        nurseIndex += 1;
        const name = names[i];
        const slug = slugify(category.expertise);
        const email = `nurse.${slug}.${i + 1}@medwasla.com`;
        const governorate = ADDRESSES[nurseIndex % ADDRESSES.length];

        const user = await new User({
          name,
          email,
          password: "nursepassword123",
          phone: `0109000${String(nurseIndex).padStart(4, "0")}`,
          governorate,
          address: governorate,
          dob: new Date(`199${i}-0${(nurseIndex % 9) + 1}-20`),
          role: "specialist",
          isVerified: true,
        }).save();

        await MedicalSpecialist.create({
          userId: user._id,
          specialistType: "nurse",
          homeVisit: true,
          serviceAreas: [...category.serviceAreas],
          areasOfExpertise: [category.expertise],
          licenseNumber: `NUR-${slug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(3, "0")}`,
          bio: `${name} provides professional ${category.expertise.toLowerCase()} services at home.`,
          consultationFee: 120 + i * 30,
          avgWaitMinutes: 8 + i * 2,
          rating: 4.4 + i * 0.15,
          reviewCount: 8 + nurseIndex,
          verificationStatus: "approved",
          availableSlots: [
            { day: DAYS[i % DAYS.length], startTime: "08:00", endTime: "16:00" },
          ],
          certifications: [
            {
              title: "B.Sc. in Nursing",
              issuedBy: `${governorate} University`,
              issuedAt: new Date("2016-07-01"),
              certificateUrl: `https://example.com/certs/${slug}-nurse-${i + 1}.pdf`,
              status: "approved",
            },
          ],
        });
      }
    }

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
