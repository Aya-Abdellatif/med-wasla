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

async function registerAndVerify(userData = basePatient) {
  await request(app).post("/api/auth/register").send(userData);
  const otp = extractOtpFromLastEmail();
  await request(app)
    .post("/api/auth/verify-otp")
    .send({ email: userData.email, otp });
}

describe("Auth Routes", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await OTP.deleteMany({});
    mockSendEmail.mockClear();
  });

  // ─── POST /api/auth/register ───────────────────────────────────────────────
  describe("POST /api/auth/register", () => {
    it("registers a new patient and returns 201", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(basePatient);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(mockSendEmail).toHaveBeenCalledOnce();
    });

    it("returns 400 when verified email already exists", async () => {
      await registerAndVerify();

      const res = await request(app)
        .post("/api/auth/register")
        .send(basePatient);

      expect(res.status).toBe(400);
    });

    it("re-sends OTP and returns 201 when email exists but is unverified", async () => {
      await request(app).post("/api/auth/register").send(basePatient);
      mockSendEmail.mockClear();

      const res = await request(app)
        .post("/api/auth/register")
        .send(basePatient);

      expect(res.status).toBe(201);
      expect(mockSendEmail).toHaveBeenCalledOnce();
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
      await request(app).post("/api/auth/register").send(basePatient);
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
      await request(app).post("/api/auth/register").send(basePatient);

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
      await request(app).post("/api/auth/register").send(basePatient);
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
      await request(app).post("/api/auth/register").send(basePatient);

      // bypass the 60s rate limit by backdating the OTP record
      // use raw collection driver because Mongoose protects the createdAt field
      await OTP.collection.updateMany(
        { email: basePatient.email },
        { $set: { createdAt: new Date(Date.now() - 61_000) } },
      );
      mockSendEmail.mockClear();

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(mockSendEmail).toHaveBeenCalledOnce();
    });

    it("returns 429 when resend is requested within 60 seconds", async () => {
      await request(app).post("/api/auth/register").send(basePatient);

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: basePatient.email });

      expect(res.status).toBe(429);
    });

    it("returns 400 for already-verified user", async () => {
      await registerAndVerify();

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
      await registerAndVerify();

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: basePatient.password });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(basePatient.email);
    });

    it("returns 403 when user is not verified", async () => {
      await request(app).post("/api/auth/register").send(basePatient);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: basePatient.password });

      expect(res.status).toBe(403);
    });

    it("returns 401 for wrong password", async () => {
      await registerAndVerify();

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

  // ─── POST /api/auth/forgot-password ──────────────────────────────────────
  describe("POST /api/auth/forgot-password", () => {
    it("sends OTP to verified user and returns 200", async () => {
      await registerAndVerify();
      mockSendEmail.mockClear();

      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: basePatient.email });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(mockSendEmail).toHaveBeenCalledOnce();
    });

    it("returns 404 for unknown email", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "ghost@test.com" });

      expect(res.status).toBe(404);
    });

    it("returns 400 for unverified account", async () => {
      await request(app).post("/api/auth/register").send(basePatient);

      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: basePatient.email });

      expect(res.status).toBe(400);
    });

    it("returns 429 when requested within 60 seconds", async () => {
      await registerAndVerify();
      await request(app).post("/api/auth/forgot-password").send({ email: basePatient.email });

      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: basePatient.email });

      expect(res.status).toBe(429);
    });
  });

  // ─── POST /api/auth/reset-password ───────────────────────────────────────
  describe("POST /api/auth/reset-password", () => {
    async function requestPasswordReset() {
      await registerAndVerify();
      mockSendEmail.mockClear();
      await request(app).post("/api/auth/forgot-password").send({ email: basePatient.email });
      return extractOtpFromLastEmail();
    }

    it("resets password with valid OTP and returns 200", async () => {
      const otp = await requestPasswordReset();

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: basePatient.email, otp, newPassword: "newpassword123" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("allows login with new password after reset", async () => {
      const otp = await requestPasswordReset();
      await request(app)
        .post("/api/auth/reset-password")
        .send({ email: basePatient.email, otp, newPassword: "newpassword123" });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: "newpassword123" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("returns 401 with old password after reset", async () => {
      const otp = await requestPasswordReset();
      await request(app)
        .post("/api/auth/reset-password")
        .send({ email: basePatient.email, otp, newPassword: "newpassword123" });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: basePatient.password });

      expect(res.status).toBe(401);
    });

    it("returns 400 for wrong OTP", async () => {
      await requestPasswordReset();

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: basePatient.email, otp: "000000", newPassword: "newpassword123" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when OTP is reused", async () => {
      const otp = await requestPasswordReset();
      await request(app)
        .post("/api/auth/reset-password")
        .send({ email: basePatient.email, otp, newPassword: "newpassword123" });

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: basePatient.email, otp, newPassword: "anotherpassword123" });

      expect(res.status).toBe(400);
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
      await registerAndVerify();
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: basePatient.email, password: basePatient.password });
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