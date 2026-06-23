import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import app from "../app.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import MedicalSpecialist from "../models/medicalSpecialist.model.js";
import Appointment from "../models/appointment.model.js";

const idOf = (doc: { _id: unknown }) => (doc._id as Types.ObjectId).toString();

function createToken(userId: string, role: "patient" | "specialist" | "admin") {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

function tomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function futureDate(days = 1) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d;
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

async function createPatient(email = "patient@test.com") {
  const user = await createUser("patient", email);
  await Patient.create({ userId: user._id });
  return user;
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
    homeVisit: true,
    licenseNumber: `LIC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    verificationStatus,
    availableSlots: [
      {
        day: new Date(tomorrowDateString()).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        startTime: "10:00",
        endTime: "12:00",
      },
    ],
  });

  return { user, specialist };
}

async function createAppointment(
  patientId: string,
  specialistId: string,
  status: "pending" | "confirmed" | "completed" | "cancelled" = "pending",
) {
  return Appointment.create({
    patientId,
    specialistId,
    date: futureDate(),
    type: "clinic",
    status,
  });
}

describe("Appointments Routes", () => {
  beforeEach(async () => {
    await Appointment.deleteMany({});
    await MedicalSpecialist.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /api/appointments/available-slots/:specialistId", () => {
    it("returns available slots for approved specialist", async () => {
      const { specialist } = await createSpecialist();

      const res = await request(app).get(
        `/api/appointments/available-slots/${idOf(specialist)}?date=${tomorrowDateString()}`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.availableSlots).toContain("10:00");
    });

    it("returns 400 when date query is missing", async () => {
      const { specialist } = await createSpecialist();

      const res = await request(app).get(
        `/api/appointments/available-slots/${idOf(specialist)}`
      );

      expect(res.status).toBe(400);
    });

    it("returns 404 when specialist does not exist", async () => {
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app).get(
        `/api/appointments/available-slots/${fakeId}?date=${tomorrowDateString()}`
      );

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/appointments", () => {
    it("creates appointment and returns 201", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          date: tomorrowDateString(),
          time: "10:00",
          type: "clinic",
          notes: "First visit",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.type).toBe("clinic");
    });

    it("returns 401 without token", async () => {
      const res = await request(app).post("/api/appointments").send({});

      expect(res.status).toBe(401);
    });

    it("returns 400 when required fields are missing", async () => {
      const patient = await createPatient();
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "clinic",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid appointment type", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          date: tomorrowDateString(),
          time: "10:00",
          type: "online",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 when home visit address is missing", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          date: tomorrowDateString(),
          time: "10:00",
          type: "home",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 when specialist is not approved", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist("pending@test.com", "pending");
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          date: tomorrowDateString(),
          time: "10:00",
          type: "clinic",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 when slot is already booked", async () => {
      const patient = await createPatient();
      const otherPatient = await createPatient("other@test.com");
      const { specialist } = await createSpecialist();
      const token = createToken(idOf(otherPatient), "patient");

      await Appointment.create({
        patientId: patient._id,
        specialistId: specialist._id,
        date: futureDate(),
        type: "clinic",
        status: "pending",
      });

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          specialistId: idOf(specialist),
          date: tomorrowDateString(),
          time: "10:00",
          type: "clinic",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/appointments/my", () => {
    it("returns patient appointments", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const token = createToken(idOf(patient), "patient");

      await createAppointment(idOf(patient), idOf(specialist));

      const res = await request(app)
        .get("/api/appointments/my")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/appointments/specialist", () => {
    it("returns specialist appointments", async () => {
      const patient = await createPatient();
      const { user, specialist } = await createSpecialist();
      const token = createToken(idOf(user), "specialist");

      await createAppointment(idOf(patient), idOf(specialist));

      const res = await request(app)
        .get("/api/appointments/specialist")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data).toHaveLength(1);
    });

    it("returns 404 when specialist profile does not exist", async () => {
      const user = await createUser("specialist", "missing-profile@test.com");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .get("/api/appointments/specialist")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/appointments/:id", () => {
    it("returns appointment by id for patient owner", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .get(`/api/appointments/${idOf(appointment)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("pending");
    });

    it("returns 403 when patient accesses another patient's appointment", async () => {
      const patient = await createPatient();
      const otherPatient = await createPatient("other@test.com");
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(otherPatient), "patient");

      const res = await request(app)
        .get(`/api/appointments/${idOf(appointment)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it("returns 404 when appointment does not exist", async () => {
      const patient = await createPatient();
      const token = createToken(idOf(patient), "patient");
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/appointments/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/appointments/:id/status", () => {
    it("specialist confirms pending appointment", async () => {
      const patient = await createPatient();
      const { user, specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist), "pending");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .patch(`/api/appointments/${idOf(appointment)}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "confirmed" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("confirmed");
    });

    it("returns 400 for invalid status transition", async () => {
      const patient = await createPatient();
      const { user, specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist), "pending");
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .patch(`/api/appointments/${idOf(appointment)}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "completed" });

      expect(res.status).toBe(400);
    });

    it("returns 403 when another specialist updates appointment", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const { user: otherUser } = await createSpecialist("other-specialist@test.com");
      const appointment = await createAppointment(idOf(patient), idOf(specialist), "pending");
      const token = createToken(idOf(otherUser), "specialist");

      const res = await request(app)
        .patch(`/api/appointments/${idOf(appointment)}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "confirmed" });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/appointments/:id/reschedule", () => {
    it("patient reschedules own appointment", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist), "confirmed");
      const token = createToken(idOf(patient), "patient");

      const newDate = futureDate(3);

      const res = await request(app)
        .patch(`/api/appointments/${idOf(appointment)}/reschedule`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          date: newDate.toISOString(),
          notes: "New time",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.notes).toBe("New time");
    });

    it("returns 403 when patient reschedules another patient's appointment", async () => {
      const patient = await createPatient();
      const otherPatient = await createPatient("other@test.com");
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(otherPatient), "patient");

      const res = await request(app)
        .patch(`/api/appointments/${idOf(appointment)}/reschedule`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          date: futureDate(2).toISOString(),
        });

      expect(res.status).toBe(403);
    });

    it("returns 400 when new date is missing", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .patch(`/api/appointments/${idOf(appointment)}/reschedule`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    it("patient cancels own appointment", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .delete(`/api/appointments/${idOf(appointment)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("cancelled");
    });

    it("specialist cancels own appointment", async () => {
      const patient = await createPatient();
      const { user, specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(user), "specialist");

      const res = await request(app)
        .delete(`/api/appointments/${idOf(appointment)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("cancelled");
    });

    it("returns 400 when cancelling completed appointment", async () => {
      const patient = await createPatient();
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist), "completed");
      const token = createToken(idOf(patient), "patient");

      const res = await request(app)
        .delete(`/api/appointments/${idOf(appointment)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it("returns 403 when patient cancels another patient's appointment", async () => {
      const patient = await createPatient();
      const otherPatient = await createPatient("other@test.com");
      const { specialist } = await createSpecialist();
      const appointment = await createAppointment(idOf(patient), idOf(specialist));
      const token = createToken(idOf(otherPatient), "patient");

      const res = await request(app)
        .delete(`/api/appointments/${idOf(appointment)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});