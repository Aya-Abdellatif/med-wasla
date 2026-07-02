import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import app from "../app.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";

const idOf = (doc: { _id: unknown }) => (doc._id as Types.ObjectId).toString();

function createToken(userId: string, role: "patient" | "specialist" | "admin") {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

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

  const token = createToken(idOf(user), "patient");

  return { user, token };
}

describe("Patient Profile Routes", () => {
  beforeEach(async () => {
    await Patient.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /api/patient/profile/:userId", () => {
    it("returns patient profile", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .get(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.patientId).toBeDefined();
      expect(res.body.user.email).toBe(user.email);
      expect(res.body.user.name).toBe(user.name);
      expect(res.body.user.phone).toBe(user.phone);
      expect(res.body.medicalHistory).toEqual([]);
    });

    it("returns 404 when patient profile not found", async () => {
      const fakeUserId = new Types.ObjectId().toString();
      const token = createToken(fakeUserId, "patient");

      const res = await request(app)
        .get(`/api/patient/profile/${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("returns 403 when requesting another patient's profile", async () => {
      const { user } = await createPatient();
      const otherToken = createToken(new Types.ObjectId().toString(), "patient");

      const res = await request(app)
        .get(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    it("returns 401 without token", async () => {
      const { user } = await createPatient();

      const res = await request(app).get(`/api/patient/profile/${idOf(user)}`);

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/patient/profile/:userId", () => {
    it("updates patient name", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Patient",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Patient");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.name).toBe("Updated Patient");
    });

    it("does not allow changing patient email", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "updated@test.com",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email cannot be changed");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.email).toBe(user.email);
    });

    it("keeps same email if sent unchanged", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: user.email,
        });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(user.email);
    });

    it("updates patient phone and normalizes it", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          phone: "1012345678",
        });

      expect(res.status).toBe(200);
      expect(res.body.phone).toBe("01012345678");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.phone).toBe("01012345678");
    });

    it("returns 400 for invalid phone", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          phone: "123",
        });

      expect(res.status).toBe(400);
    });

    it("updates governorate", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          governorate: "Giza",
        });

      expect(res.status).toBe(200);
      expect(res.body.governorate).toBe("Giza");
    });

    it("returns 400 for invalid governorate", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          governorate: "InvalidCity",
        });

      expect(res.status).toBe(400);
    });

    it("updates address", async () => {
      const { user, token } = await createPatient();

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          address: "New Cairo",
        });

      expect(res.status).toBe(200);
      expect(res.body.address).toBe("New Cairo");
    });

    it("returns 404 when patient not found", async () => {
      const fakeUserId = new Types.ObjectId().toString();
      const token = createToken(fakeUserId, "patient");

      const res = await request(app)
        .patch(`/api/patient/profile/${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "No User",
        });

      expect(res.status).toBe(404);
    });

    it("returns 403 when updating another patient's profile", async () => {
      const { user } = await createPatient();
      const otherToken = createToken(new Types.ObjectId().toString(), "patient");

      const res = await request(app)
        .patch(`/api/patient/profile/${idOf(user)}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ name: "Hacked Name" });

      expect(res.status).toBe(403);
    });
  });
});