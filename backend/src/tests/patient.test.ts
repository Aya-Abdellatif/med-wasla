import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { Types } from "mongoose";

import app from "../app.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";

const idOf = (doc: { _id: unknown }) => (doc._id as Types.ObjectId).toString();

async function createPatient(email = "patient@test.com") {
  const user = await User.create({
    name: "patient user",
    email,
    password: "password123",
    dob: new Date("1998-05-15"),
    phone: "01234567890",
    governorate: "Cairo",
    address: "Cairo",
    role: "patient",
    isVerified: true,
  });

  await Patient.create({
    userId: user._id,
  });

  return user;
}

describe("Patient Profile Routes", () => {
  beforeEach(async () => {
    await Patient.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /api/patient/profile/:userId", () => {
    it("returns patient profile", async () => {
      const user = await createPatient();

      const res = await request(app).get(`/api/patient/profile/${idOf(user)}`);

      expect(res.status).toBe(200);
      expect(res.body.patientId).toBeDefined();
      expect(res.body.user.email).toBe(user.email);
      expect(res.body.user.name).toBe(user.name);
      expect(res.body.medicalHistory).toEqual([]);
    });

    it("returns 404 when patient profile not found", async () => {
      const fakeUserId = new Types.ObjectId().toString();

      const res = await request(app).get(`/api/patient/profile/${fakeUserId}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/patient/profile/:userId", () => {
    it("updates patient name", async () => {
      const user = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .send({
          name: "Updated Patient",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Patient");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.name).toBe("Updated Patient");
    });

    it("updates patient email", async () => {
      const user = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .send({
          email: "updated@test.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("updated@test.com");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.email).toBe("updated@test.com");
    });

    it("updates patient phone and normalizes it", async () => {
      const user = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .send({
          phone: "1012345678",
        });

      expect(res.status).toBe(200);
      expect(res.body.phone).toBe("01012345678");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.phone).toBe("01012345678");
    });

    it("returns 400 for invalid email", async () => {
      const user = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .send({
          email: "invalid-email",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid phone", async () => {
      const user = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .send({
          phone: "123",
        });

      expect(res.status).toBe(400);
    });

    it("returns 404 when patient not found", async () => {
      const fakeUserId = new Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/patient/profile/${fakeUserId}`)
        .send({
          name: "No User",
        });

      expect(res.status).toBe(404);
    });
  });
});