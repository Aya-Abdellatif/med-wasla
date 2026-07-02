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

async function createAdminToken() {
  const admin = await createUser("admin", `admin-${Date.now()}@test.com`);
  return createToken(idOf(admin), "admin");
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
  email: string,
  verificationStatus: "pending" | "approved" | "rejected" = "pending"
) {
  const user = await createUser("specialist", email);

  const specialist = await MedicalSpecialist.create({
    userId: user._id,
    specialistType: "doctor",
    specialization: "Cardiology",
    homeVisit: false,
    licenseNumber: `LIC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    verificationStatus,
    certifications: [
      {
        title: "Medical License",
        certificateUrl: "https://example.com/cert.pdf",
        issuedBy: "Medical Syndicate",
        status: "pending",
      },
    ],
  });

  return { user, specialist };
}

describe("Admin Routes", () => {
  let adminToken: string;

  beforeEach(async () => {
    await MedicalSpecialist.deleteMany({});
    await User.deleteMany({});
    adminToken = await createAdminToken();
  });

  describe("Access control", () => {
    it("rejects requests without a token", async () => {
      const res = await request(app).get("/api/admin/specialists/pending");
      expect(res.status).toBe(401);
    });

    it("rejects non-admin roles", async () => {
      const patientToken = createToken(new Types.ObjectId().toString(), "patient");

      const res = await request(app)
        .get("/api/admin/specialists/pending")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/specialists/pending", () => {
    it("returns pending specialists", async () => {
      await createSpecialist("pending@test.com", "pending");
      await createSpecialist("approved@test.com", "approved");

      const res = await request(app)
        .get("/api/admin/specialists/pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].verificationStatus).toBe("pending");
    });

    it("returns empty array when no pending specialists exist", async () => {
      await createSpecialist("approved@test.com", "approved");

      const res = await request(app)
        .get("/api/admin/specialists/pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("GET /api/admin/specialists", () => {
    it("returns all specialists", async () => {
      await createSpecialist("pending@test.com", "pending");
      await createSpecialist("approved@test.com", "approved");
      await createSpecialist("rejected@test.com", "rejected");

      const res = await request(app)
        .get("/api/admin/specialists")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data).toHaveLength(3);
    });
  });

  describe("PATCH /api/admin/specialists/:id/approve", () => {
    it("approves specialist successfully", async () => {
      const { specialist } = await createSpecialist("doctor@test.com", "pending");

      const res = await request(app)
        .patch(`/api/admin/specialists/${idOf(specialist)}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Specialist approved successfully");
      expect(res.body.data.verificationStatus).toBe("approved");

      const updated = await MedicalSpecialist.findById(idOf(specialist));

      expect(updated?.verificationStatus).toBe("approved");
      expect(updated?.certifications?.[0]?.status).toBe("approved");
    });

    it("returns 404 when specialist does not exist", async () => {
      const fakeSpecialistId = new Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/admin/specialists/${fakeSpecialistId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Medical specialist not found");
    });
  });

  describe("PATCH /api/admin/specialists/:id/reject", () => {
    it("rejects specialist successfully", async () => {
      const { specialist } = await createSpecialist("doctor2@test.com", "pending");

      const res = await request(app)
        .patch(`/api/admin/specialists/${idOf(specialist)}/reject`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Specialist rejected successfully");
      expect(res.body.data.verificationStatus).toBe("rejected");

      const updated = await MedicalSpecialist.findById(idOf(specialist));

      expect(updated?.verificationStatus).toBe("rejected");
      expect(updated?.certifications?.[0]?.status).toBe("rejected");
    });

    it("returns 404 when specialist does not exist", async () => {
      const fakeSpecialistId = new Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/admin/specialists/${fakeSpecialistId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Medical specialist not found");
    });
  });
});