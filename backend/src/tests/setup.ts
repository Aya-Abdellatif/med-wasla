import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

function beforeAll(arg0: () => Promise<void>) {
    throw new Error("Function not implemented.");
}


function afterAll(arg0: () => Promise<void>) {
    throw new Error("Function not implemented.");
}
