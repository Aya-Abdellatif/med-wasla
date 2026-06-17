import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../utils/sendEmail.js", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

import app from "../app.js";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import sendEmail from "../utils/sendEmail.js";

const mockSendEmail = vi.mocked(sendEmail);

const basePatient = {
  name: "Test Patient",
  email: "patient@test.com",
  password: "password123",
  dob: new Date("1998-05-15"),
  phone: "01234567890",
  governorate: "Cairo",
  address: "Cairo",
  role: "patient",
};

function extractOtpFromLastEmail(): string {
  const calls = mockSendEmail.mock.calls;
  const lastCall = calls[calls.length - 1][0] as { html: string };
  const match = lastCall.html.match(/<strong>(\d+)<\/strong>/);
  if (!match) throw new Error("Could not extract OTP from email HTML");
  return match[1];
}

async function registerUser(userData = basePatient) {
  const res = await request(app).post("/api/auth/register").send(userData);
  return res;
}

async function createUnverifiedUser(userData = basePatient) {
  await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    address: userData.address as "Cairo",
    role: userData.role as "patient",
    isVerified: false,
  });
}

describe("Auth Routes", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await OTP.deleteMany({});
    mockSendEmail.mockClear();
  });

  // ─── POST /api/auth/register ───────────────────────────────────────────────
  describe("POST /api/auth/register", () => {
    it("registers a new patient and returns 201 with token", async () => {
      const res = await registerUser();

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(basePatient.email);
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("marks user as verified immediately after registration", async () => {
      await registerUser();

      const user = await User.findOne({ email: basePatient.email });
      expect(user?.isVerified).toBe(true);
    });

    it("returns 400 when email already exists", async () => {
      await registerUser();

      const res = await registerUser();

      expect(res.status).toBe(400);
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "incomplete@test.com", password: "password123" });

      expect(res.status).toBe(400);
    });
  });

  // ─── POST /api/auth/verify-otp ────────────────────────────────────────────
  describe("POST /api/auth/verify-otp", () => {
    it("verifies correct OTP and returns token + user", async () => {
      await createUnverifiedUser();
      await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });
      const otp = extractOtpFromLastEmail();

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: basePatient.email, otp });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(basePatient.email);
    });

    it("returns 400 for wrong OTP", async () => {
      await createUnverifiedUser();
      await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: basePatient.email, otp: "000000" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when no OTP record exists for email", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "nobody@test.com", otp: "123456" });

      expect(res.status).toBe(400);
    });

    it("marks user as verified after successful OTP", async () => {
      await createUnverifiedUser();
      await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });
      const otp = extractOtpFromLastEmail();

      await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: basePatient.email, otp });

      const user = await User.findOne({ email: basePatient.email });
      expect(user?.isVerified).toBe(true);
    });
  });

  // ─── POST /api/auth/resend-otp ────────────────────────────────────────────
  describe("POST /api/auth/resend-otp", () => {
    it("resends OTP for unverified user and returns 200", async () => {
      await createUnverifiedUser();

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(mockSendEmail).toHaveBeenCalledOnce();
    });

    it("returns 400 for already-verified user", async () => {
      await registerUser();

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });

      expect(res.status).toBe(400);
    });

    it("returns 404 for unknown email", async () => {
      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: "ghost@test.com" });

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/auth/login ─────────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    it("logs in a verified user and returns token", async () => {
      await registerUser();

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: basePatient.password });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(basePatient.email);
    });

    it("returns 403 when user is not verified", async () => {
      await createUnverifiedUser();

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: basePatient.password });

      expect(res.status).toBe(403);
    });

    it("returns 401 for wrong password", async () => {
      await registerUser();

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("returns 401 for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@test.com", password: "password123" });

      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/auth/logout ────────────────────────────────────────────────
  describe("POST /api/auth/logout", () => {
    it("returns 200 always", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });

  // ─── GET /api/auth/me ─────────────────────────────────────────────────────
  describe("GET /api/auth/me", () => {
    async function getAuthToken(): Promise<string> {
      const res = await registerUser();
      return res.body.token as string;
    }

    it("returns current user with valid Bearer token", async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.user.email).toBe(basePatient.email);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("returns 401 with a malformed token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer not.a.valid.token");

      expect(res.status).toBe(401);
    });

    it("returns 401 with a valid-looking but incorrectly signed token", async () => {
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJwYXRpZW50In0.wrongsignature";

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(res.status).toBe(401);
    });
  });
});
