import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import app from "../app.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import MedicalSpecialist from "../models/medicalSpecialist.model.js";
import Appointment from "../models/appointment.model.js";
import Queue from "../models/queue.model.js";

const idOf = (doc: { _id: unknown }) =>
  (doc._id as Types.ObjectId).toString();

function createToken(userId: string, role: "patient" | "specialist" | "admin") {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

async function createUser(
  role: "patient" | "specialist" | "admin",
  email: string
) {
  return User.create({
    name: `${role} user`,
    email,
    password: "password123",
    dob: new Date("1998-05-15"),
    phone: "01234567890",
    governorate: "Cairo",
    address: "",
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
    licenseNumber: "LIC-QUEUE-123",
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
    status: "confirmed",
  });
}

describe("Queue Routes", () => {
  beforeEach(async () => {
    await Queue.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalSpecialist.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
  });

  it("joins queue and returns 201", async () => {
    const patient = await createPatient();
    const { specialist } = await createSpecialist();
    const appointment = await createAppointment(idOf(patient), idOf(specialist));
    const token = createToken(idOf(patient), "patient");

    const res = await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${token}`)
      .send({
        specialistId: idOf(specialist),
        appointmentId: idOf(appointment),
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.queueNumber).toBe(1);
  });

  it("returns 400 when patient already joined queue", async () => {
    const patient = await createPatient();
    const { specialist } = await createSpecialist();
    const appointment = await createAppointment(idOf(patient), idOf(specialist));
    const token = createToken(idOf(patient), "patient");

    const payload = {
      specialistId: idOf(specialist),
      appointmentId: idOf(appointment),
    };

    await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const res = await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(400);
  });

  it("returns 401 when joining without token", async () => {
    const res = await request(app).post("/api/queue/join").send({});

    expect(res.status).toBe(401);
  });

  it("gets queue by specialist id", async () => {
    const patient = await createPatient();
    const { specialist } = await createSpecialist();
    const appointment = await createAppointment(idOf(patient), idOf(specialist));
    const token = createToken(idOf(patient), "patient");

    await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${token}`)
      .send({
        specialistId: idOf(specialist),
        appointmentId: idOf(appointment),
      });

    const res = await request(app).get(`/api/queue/${idOf(specialist)}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.entries).toHaveLength(1);
  });

  it("gets my position in queue", async () => {
    const patient = await createPatient();
    const { specialist } = await createSpecialist();
    const appointment = await createAppointment(idOf(patient), idOf(specialist));
    const token = createToken(idOf(patient), "patient");

    await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${token}`)
      .send({
        specialistId: idOf(specialist),
        appointmentId: idOf(appointment),
      });

    const res = await request(app)
      .get("/api/queue/my-position")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.position).toBe(1);
  });

  it("leaves queue and returns 200", async () => {
    const patient = await createPatient();
    const { specialist } = await createSpecialist();
    const appointment = await createAppointment(idOf(patient), idOf(specialist));
    const token = createToken(idOf(patient), "patient");

    await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${token}`)
      .send({
        specialistId: idOf(specialist),
        appointmentId: idOf(appointment),
      });

    const res = await request(app)
      .delete("/api/queue/leave")
      .set("Authorization", `Bearer ${token}`)
      .send({
        appointmentId: idOf(appointment),
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("specialist can set queue status", async () => {
    const { user } = await createSpecialist();
    const token = createToken(idOf(user), "specialist");

    const res = await request(app)
      .patch("/api/queue/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ active: false });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.isActive).toBe(false);
  });

  it("specialist can call next patient", async () => {
    const patient = await createPatient();
    const { user: specialistUser, specialist } = await createSpecialist();
    const appointment = await createAppointment(idOf(patient), idOf(specialist));

    const patientToken = createToken(idOf(patient), "patient");
    const specialistToken = createToken(idOf(specialistUser), "specialist");

    await request(app)
      .post("/api/queue/join")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        specialistId: idOf(specialist),
        appointmentId: idOf(appointment),
      });

    const res = await request(app)
      .patch("/api/queue/next")
      .set("Authorization", `Bearer ${specialistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.next.status).toBe("in_progress");
  });
});