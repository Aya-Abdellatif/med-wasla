import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import app from "../app.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import MedicalSpecialist from "../models/medicalSpecialist.model.js";
import Appointment from "../models/appointment.model.js";
import Review from "../models/review.model.js";

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
    phone: "01234567890",
    address: "Cairo",
    role,
    isVerified: true,
  });
}

async function createPatient(email = "patient@test.com") {
  const user = await createUser("patient", email);
  await Patient.create({ userId: user._id });
  return user;
}

async function createSpecialist() {
  const user = await createUser("specialist", "doctor@test.com");

  const specialist = await MedicalSpecialist.create({
    userId: user._id,
    specialistType: "doctor",
    specialization: "Cardiology",
    homeVisit: false,
    licenseNumber: "LIC-12345",
    verificationStatus: "approved",
  });

  return { user, specialist };
}

async function createAppointment(patientId: string, specialistId: string) {
  return Appointment.create({
    patientId,
    specialistId,
    date: new Date(),
    type: "clinic",
    status: "completed",
  });
}

describe("Reviews Routes", () => {
  beforeEach(async () => {
    await Review.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalSpecialist.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
  });

  describe("POST /api/reviews", () => {
    it("creates review and returns 201", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          appointmentId: idOf(appointment),
          rating: 5,
          comment: "Great doctor",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    it("returns 401 without token", async () => {
      const res = await request(app).post("/api/reviews").send({});

      expect(res.status).toBe(401);
    });

    it("returns 400 when required fields are missing", async () => {
      const patient = await createPatient();
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.status).toBe(400);
    });

    it("returns 400 when rating is invalid", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          appointmentId: idOf(appointment),
          rating: 6,
        });

      expect(res.status).toBe(400);
    });

    it("returns 409 when appointment is already reviewed", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(patient), "patient");

      const payload = {
        specialistId: idOf(specialist),
        appointmentId: idOf(appointment),
        rating: 5,
        comment: "Good",
      };

      await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/reviews/specialist/:id", () => {
    it("returns specialist reviews with average rating", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));

      await Review.create({
        patientId: patient._id,
        specialistId: specialist._id,
        appointmentId: appointment._id,
        rating: 4,
        comment: "Good",
      });

      const res = await request(app).get(`/api/reviews/specialist/${idOf(specialist)}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.averageRating).toBe(4);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("PUT /api/reviews/:id", () => {
    it("updates own review and returns 200", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));

      const review = await Review.create({
        patientId: patient._id,
        specialistId: specialist._id,
        appointmentId: appointment._id,
        rating: 3,
        comment: "Okay",
      });

      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .put(`/api/reviews/${idOf(review)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5, comment: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe("Updated");
    });

    it("returns 403 when another patient updates review", async () => {
      const patient = await createPatient();
      const otherPatient = await createPatient("other@test.com");
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));

      const review = await Review.create({
        patientId: patient._id,
        specialistId: specialist._id,
        appointmentId: appointment._id,
        rating: 4,
      });

      const token = createToken(idOf(otherPatient), "patient");

      const res = await request(app)
        .put(`/api/reviews/${idOf(review)}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.status).toBe(403);
    });

    it("returns 404 when review not found", async () => {
      const patient = await createPatient();
      const token = createToken(idOf(patient), "patient");
      const fakeReviewId = new Types.ObjectId().toString();

      const res = await request(app)
        .put(`/api/reviews/${fakeReviewId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    it("deletes own review and returns 200", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));

      const review = await Review.create({
        patientId: patient._id,
        specialistId: specialist._id,
        appointmentId: appointment._id,
        rating: 5,
      });

      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .delete(`/api/reviews/${idOf(review)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Review.findById(review._id);
      expect(deleted).toBeNull();
    });

    it("returns 403 when another patient deletes review", async () => {
      const patient = await createPatient();
      const otherPatient = await createPatient("other@test.com");
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));

      const review = await Review.create({
        patientId: patient._id,
        specialistId: specialist._id,
        appointmentId: appointment._id,
        rating: 5,
      });

      const token = createToken(idOf(otherPatient), "patient");

      const res = await request(app)
        .delete(`/api/reviews/${idOf(review)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it("allows admin to delete any review", async () => {
      const patient = await createPatient();
      const admin = await createUser("admin", "admin@test.com");
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));

      const review = await Review.create({
        patientId: patient._id,
        specialistId: specialist._id,
        appointmentId: appointment._id,
        rating: 5,
      });

      const token = createToken(idOf(admin), "admin");

      const res = await request(app)
        .delete(`/api/reviews/${idOf(review)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it("returns 404 when review not found", async () => {
      const patient = await createPatient();
      const token = createToken(idOf(patient), "patient");
      const fakeReviewId = new Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/reviews/${fakeReviewId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});