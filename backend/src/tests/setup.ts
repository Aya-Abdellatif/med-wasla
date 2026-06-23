import { beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "7d";
process.env.EMAIL_USER = "test@test.com";
process.env.EMAIL_PASS = "testpass";

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});