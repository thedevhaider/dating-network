const chai = require("chai");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../app");
const request = require("supertest");

chai.use(require("chai-http"));
const expect = chai.expect;

let mongoServer;

before(async () => {
  // Start an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

after(async () => {
  // Close the server
  await app.close();

  // Stop the in-memory MongoDB server and close the database connection
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Add a beforeEach hook to clean the database before each test
beforeEach(async () => {
  // Remove all documents from the MongoDB collections you want to clean
  await mongoose.connection.collections.users.deleteMany({});
});

describe("User Routes", () => {
  // Test for GET /api/users/test using supertest
  describe("GET /api/users/test", () => {
    it("should return a JSON object with 'user' property", async () => {
      const res = await request(app).get("/api/users/test");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("user").to.equal("Users Working");
    });
  });

  // Test for POST /api/users/register using supertest
  describe("POST /api/users/register", () => {
    it("should register a new user and return a JSON object with user details", async () => {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
      };

      const res = await request(app).post("/api/users/register").send(newUser);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("name").to.equal(newUser.name);
      expect(res.body).to.have.property("email").to.equal(newUser.email);
    });
  });

  // Test for GET /api/users/:user_id using supertest
  describe("GET /api/users/:user_id", () => {
    it("should return a user's details if a valid user_id is provided", async () => {
      const testUser = {
        name: "Test User",
        email: "test@example.com",
      };

      const test_register = await request(app)
        .post("/api/users/register")
        .send(testUser);

      const userId = test_register.body._id;

      const res = await request(app).get(`/api/users/${userId}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
    });

    it("should return a 404 error if an invalid user_id is provided", async () => {
      const invalidUserId = "6518240fec3abac1f6b02a9d";

      const res = await request(app).get(`/api/users/${invalidUserId}`);
      expect(res.status).to.equal(404);
    });
  });

  // Test for GET /api/users using supertest
  describe("GET /api/users", () => {
    it("should return an array of users", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });
  });
});
