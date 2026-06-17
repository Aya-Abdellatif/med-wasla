import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import MedicalSpecialist from "../models/medicalSpecialist.model.js";
// Load environment variables (supports .env and env)
dotenv.config();
if (!process.env.DATABASE_CONNECTION_STRING) {
  dotenv.config({ path: "env" });
}

const dbUri = process.env.DATABASE_CONNECTION_STRING;

if (!dbUri) {
  console.error("Error: DATABASE_CONNECTION_STRING is not defined in environment variables.");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB.");

    // Clear existing data
    console.log("Clearing existing users and specialists...");
    await User.deleteMany({});
    await MedicalSpecialist.deleteMany({});
    await Patient.deleteMany({});
    console.log("Existing data cleared.");

    // 1. Create Admin
    console.log("Creating Admin account...");
    const adminUser = new User({
      name: "Admin MedWasla",
      email: "admin@medwasla.com",
      password: "adminpassword123",
      phone: "01000000001",
      governorate: "Cairo",
      address: "Cairo",
      dob: new Date("1985-01-15"),
      role: "admin",
      isVerified: true,
    });
    await adminUser.save();
    console.log("Admin account created.");

    // 2. Create Patient
    console.log("Creating Patient account...");
    const patientUser = new User({
      name: "Ahmed Ali",
      email: "ahmed.patient@gmail.com",
      password: "patientpassword123",
      phone: "01123456789",
      governorate: "Giza",
      address: "Giza",
      dob: new Date("1995-06-20"),
      role: "patient",
      isVerified: true,
    });
    await patientUser.save();

    await Patient.create({ userId: patientUser._id });
    console.log("Patient account created.");

    // 3. Create Approved Doctor (Clinic Only)
    console.log("Creating Approved Clinic Doctor...");
    const clinicDoctorUser = new User({
      name: "Dr. Khaled Selim",
      email: "khaled.selim@medwasla.com",
      password: "doctorpassword123",
      phone: "01234567890",
      governorate: "Cairo",
      address: "Cairo",
      dob: new Date("1980-03-10"),
      role: "specialist",
      isVerified: true,
    });
    await clinicDoctorUser.save();

    const clinicDoctorSpecialist = new MedicalSpecialist({
      userId: clinicDoctorUser._id,
      specialistType: "doctor",
      specialization: "Cardiology",
      clinicAddress: "12 El-Tahrir Sq, Downtown, Cairo",
      homeVisit: false,
      licenseNumber: "DOC-12345",
      bio: "Senior Cardiologist with over 15 years of experience in cardiovascular healthcare.",
      consultationFee: 300,
      avgWaitMinutes: 15,
      rating: 4.8,
      reviewCount: 24,
      verificationStatus: "approved",
      availableSlots: [
        { day: "Monday", startTime: "10:00", endTime: "14:00" },
        { day: "Wednesday", startTime: "14:00", endTime: "18:00" }
      ],
      certifications: [
        {
          title: "MD in Cardiology",
          issuedBy: "Cairo University",
          issuedAt: new Date("2010-06-15"),
          certificateUrl: "https://example.com/certs/khaled_md.pdf",
          status: "approved"
        }
      ]
    });
    await clinicDoctorSpecialist.save();
    console.log("Approved Clinic Doctor created.");

    // 4. Create Pending Doctor (Home Visit)
    console.log("Creating Pending Home Visit Doctor...");
    const homeDoctorUser = new User({
      name: "Dr. Mona Youssef",
      email: "mona.youssef@medwasla.com",
      password: "doctorpassword123",
      phone: "01512345678",
      governorate: "Alexandria",
      address: "Alexandria",
      dob: new Date("1988-11-05"),
      role: "specialist",
      isVerified: true,
    });
    await homeDoctorUser.save();

    const homeDoctorSpecialist = new MedicalSpecialist({
      userId: homeDoctorUser._id,
      specialistType: "doctor",
      specialization: "Pediatrics",
      clinicAddress: "45 El-Corniche Road, Alexandria",
      homeVisit: true,
      licenseNumber: "DOC-67890",
      bio: "Pediatrician passionate about children healthcare, offering clinic and home consultations.",
      consultationFee: 250,
      avgWaitMinutes: 20,
      rating: 0,
      reviewCount: 0,
      verificationStatus: "pending",
      availableSlots: [
        { day: "Sunday", startTime: "09:00", endTime: "13:00" },
        { day: "Tuesday", startTime: "16:00", endTime: "20:00" }
      ],
      certifications: [
        {
          title: "Master's Degree in Pediatrics",
          issuedBy: "Alexandria University",
          issuedAt: new Date("2015-09-20"),
          certificateUrl: "https://example.com/certs/mona_masters.pdf",
          status: "pending"
        },
        {
          title: "Child Care Specialization Fellowship",
          issuedBy: "Royal College of Pediatrics",
          issuedAt: new Date("2018-05-10"),
          certificateUrl: "https://example.com/certs/mona_fellowship.pdf",
          status: "pending"
        }
      ]
    });
    await homeDoctorSpecialist.save();
    console.log("Pending Home Visit Doctor created.");

    // 5. Create Pending Nurse (Home Visit by default)
    console.log("Creating Pending Nurse...");
    const nurseUser = new User({
      name: "Nurse Salma Mourad",
      email: "salma.mourad@medwasla.com",
      password: "nursepassword123",
      phone: "01098765432",
      governorate: "Giza",
      address: "Giza",
      dob: new Date("1992-08-12"),
      role: "specialist",
      isVerified: true,
    });
    await nurseUser.save();

    const nurseSpecialist = new MedicalSpecialist({
      userId: nurseUser._id,
      specialistType: "nurse",
      homeVisit: true,
      serviceAreas: ["Giza", "Haram", "Faisal"],
      licenseNumber: "NUR-98765",
      bio: "Registered nurse experienced in geriatric and post-operative home care.",
      consultationFee: 150,
      avgWaitMinutes: 10,
      rating: 0,
      reviewCount: 0,
      verificationStatus: "pending",
      availableSlots: [
        { day: "Saturday", startTime: "08:00", endTime: "16:00" },
        { day: "Thursday", startTime: "12:00", endTime: "20:00" }
      ],
      certifications: [
        {
          title: "B.Sc. in Nursing",
          issuedBy: "Helwan University",
          issuedAt: new Date("2018-07-01"),
          certificateUrl: "https://example.com/certs/salma_bsc.pdf",
          status: "pending"
        }
      ]
    });
    await nurseSpecialist.save();
    console.log("Pending Nurse created.");

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
