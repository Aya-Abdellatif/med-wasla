import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import app from "../app.js";
import User from "../models/user.model.js";
import MedicalSpecialist from "../models/medicalSpecialist.model.js";

const idOf = (doc: { _id: unknown }) => (doc._id as Types.ObjectId).toString();

function createToken(userId: string, role: "patient" | "specialist" | "admin") {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

async function createUser(role: "patient" | "specialist" | "admin", email: string) {
  return User.create({
    name: `${role} user`,
    email,
    password: "password123",
    dob: new Date("1998-05-15"),
    phone: "01234567890",
    governorate: "Cairo",
    address: "Cairo",
    role,
    isVerified: true,
  });
}

async function createSpecialist(
  email = "specialist@test.com",
  verificationStatus: "pending" | "approved" | "rejected" = "approved",
) {
  const user = await createUser("specialist", email);

  const specialist = await MedicalSpecialist.create({
    userId: user._id,
    specialistType: "doctor",
    specialization: "Cardiology",
    homeVisit: false,
    licenseNumber: `LIC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    verificationStatus,
    bio: "Experienced cardiologist",
    clinicAddress: "Cairo Clinic",
    consultationFee: 300,
    areasOfExpertise: ["Heart", "Blood pressure"],
    certifications: [
      {
        title: "Medical License",
        issuedBy: "Medical Syndicate",
        certificateUrl: "https://example.com/cert.pdf",
        status: "pending",
      },
    ],
  });

  return { user, specialist };
}

describe("Specialists Routes", () => {
  beforeEach(async () => {
    await MedicalSpecialist.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /api/specialists", () => {
    it("returns only approved specialists", async () => {
      await createSpecialist("approved@test.com", "approved");
      await createSpecialist("pending@test.com", "pending");

      const res = await request(app).get("/api/specialists");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specialists).toHaveLength(1);
      expect(res.body.data.specialists[0].verificationStatus).toBe("approved");
    });

    it("filters specialists by specialization", async () => {
      await createSpecialist("cardiology@test.com", "approved");

      const user = await createUser("specialist", "dermatology@test.com");
      await MedicalSpecialist.create({
        userId: user._id,
        specialistType: "doctor",
        specialization: "Dermatology",
        homeVisit: false,
        licenseNumber: `LIC-${Date.now()}-DERM`,
        verificationStatus: "approved",
      });

      const res = await request(app).get(
        "/api/specialists?specialization=Cardiology",
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specialists).toHaveLength(1);
      expect(res.body.data.specialists[0].specialization).toBe("Cardiology");
    });
  });

  describe("GET /api/specialists/:id", () => {
    it("returns specialist by id", async () => {
      const { specialist } = await createSpecialist("doctor@test.com", "approved");

      const res = await request(app).get(`/api/specialists/${idOf(specialist)}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specialization).toBe("Cardiology");
    });

    it("returns 404 when specialist does not exist", async () => {
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app).get(`/api/specialists/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 for non-approved specialist in public endpoint", async () => {
      const { specialist } = await createSpecialist("pending@test.com", "pending");

      const res = await request(app).get(`/api/specialists/${idOf(specialist)}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/specialists/specialization/:name", () => {
    it("returns specialists by specialization", async () => {
      await createSpecialist("cardio@test.com", "approved");

      const res = await request(app).get(
        "/api/specialists/specialization/Cardiology",
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].specialization).toBe("Cardiology");
    });
  });

  describe("GET /api/specialists/me", () => {
    it("returns authenticated specialist profile", async () => {
      const { user } = await createSpecialist("me@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .get("/api/specialists/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specialization).toBe("Cardiology");
    });

    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/specialists/me");

      expect(res.status).toBe(401);
    });

    it("returns 403 when user is not specialist", async () => {
      const user = await createUser("patient", "patient@test.com");
      const token = createToken(idOf(user), "patient");

      const res = await request(app)
        .get("/api/specialists/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/specialists/profile", () => {
    it("submits profile changes for admin review", async () => {
      const { user } = await createSpecialist("profile@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .put("/api/specialists/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          bio: "Updated bio",
          clinicAddress: "Updated Clinic",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Changes submitted for admin review");
      expect(res.body.data.verificationStatus).toBe("pending");
      expect(res.body.data.updatedFields.bio).toBe("Updated bio");

      const specialist = await MedicalSpecialist.findOne({ userId: user._id });
      expect(specialist?.verificationStatus).toBe("pending");
      expect(specialist?.pendingProfileUpdates?.bio).toBe("Updated bio");
    });

    it("returns 400 when no profile changes submitted", async () => {
      const { user } = await createSpecialist("nochange@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .put("/api/specialists/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          bio: "Experienced cardiologist",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/specialists/availability", () => {
    it("updates availability successfully", async () => {
      const { user } = await createSpecialist("availability@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .put("/api/specialists/availability")
        .set("Authorization", `Bearer ${token}`)
        .send({
          availableSlots: [
            {
              day: "Monday",
              startTime: "10:00",
              endTime: "12:00",
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.availableSlots).toHaveLength(1);
      expect(res.body.data.availableSlots[0].day).toBe("Monday");
    });

    it("returns 400 when availableSlots is not an array", async () => {
      const { user } = await createSpecialist("badslots@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .put("/api/specialists/availability")
        .set("Authorization", `Bearer ${token}`)
        .send({
          availableSlots: "Monday",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/specialists/fees", () => {
    it("updates consultation fee successfully", async () => {
      const { user } = await createSpecialist("fees@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .put("/api/specialists/fees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          consultationFee: 500,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.consultationFee).toBe(500);
    });

    it("returns 400 when consultation fee is negative", async () => {
      const { user } = await createSpecialist("badfee@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .put("/api/specialists/fees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          consultationFee: -100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/specialists/me/certificates", () => {
    it("adds certificate successfully", async () => {
      const { user } = await createSpecialist("certificate@test.com", "approved");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .post("/api/specialists/me/certificates")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Certificate",
          issuedBy: "Medical Syndicate",
          certificateUrl: "https://example.com/new-cert.pdf",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificate.title).toBe("New Certificate");
      expect(res.body.data.certificate.status).toBe("pending");
      expect(res.body.data.verificationStatus).toBe("pending");

      const specialist = await MedicalSpecialist.findOne({ userId: user._id });
      expect(specialist?.certifications).toHaveLength(2);
      expect(specialist?.verificationStatus).toBe("pending");
    });

    it("returns 404 when specialist profile not found", async () => {
      const user = await createUser("specialist", "nospecialist@test.com");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .post("/api/specialists/me/certificates")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Certificate",
          issuedBy: "Medical Syndicate",
          certificateUrl: "https://example.com/cert.pdf",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});