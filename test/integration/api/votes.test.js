const assert = require("assert");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../app");
const Vote = require("../../../models/Vote");
const User = require("../../../models/User");
const Profile = require("../../../models/Profile");

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

// Helper function to create a user in the test database
async function createUser(name, email) {
  const newUser = new User({ name, email });
  await newUser.save();
  return newUser;
}

// Helper function to create a profile in the test database
async function createProfile(user, profileData) {
  const newProfile = new Profile({ user, ...profileData });
  await newProfile.save();
  return newProfile;
}

describe("Vote Routes", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await Vote.deleteMany({});
    await User.deleteMany({});
    await Profile.deleteMany({});
  });

  describe("POST /api/votes", () => {
    it("should create a new vote", async () => {
      const user = await createUser("Test User", "test@example.com");
      const profileData = {
        name: "Test Profile",
        description: "Test description",
      };
      const newProfile = await createProfile(user, profileData);
      const response = await request(app).post("/api/votes").send({
        user: user._id,
        profile: newProfile._id,
        title: "Vote Title",
        description: "Vote Description",
        mbti: "ESTJ",
        enneagram: "1w2",
        zodiac: "Aries",
      });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.title, "Vote Title");
    });
  });

  describe("POST /api/votes/like/:vote_id", () => {
    it("should like a vote", async () => {
      const user = await createUser("Test User", "test@example.com");
      const profileData = {
        name: "Test Profile",
        description: "Test description",
      };
      const newProfile = await createProfile(user, profileData);
      const vote = new Vote({
        user: user._id,
        profile: newProfile._id,
        title: "Vote Title",
        description: "Vote Description",
        mbti: "ESTJ",
        enneagram: "1w2",
        zodiac: "Aries",
      });
      await vote.save();

      const response = await request(app)
        .post(`/api/votes/like/${vote._id}`)
        .send({ user: user._id });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.likes[0].user, user._id.toString());
    });
  });

  describe("POST /api/votes/unlike/:vote_id", () => {
    it("should unlike a vote", async () => {
      const user = await createUser("Test User", "test@example.com");
      const profileData = {
        name: "Test Profile",
        description: "Test description",
      };
      const newProfile = await createProfile(user, profileData);
      const vote = new Vote({
        user: user._id,
        profile: newProfile._id,
        title: "Vote Title",
        description: "Vote Description",
        mbti: "ESTJ",
        enneagram: "1w2",
        zodiac: "Aries",
        likes: [{ user: user._id }],
      });
      await vote.save();

      const response = await request(app)
        .post(`/api/votes/unlike/${vote._id}`)
        .send({ user: user._id });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.likes.length, 0);
    });
  });

  describe("GET /api/votes", () => {
    it("should get all votes with default filters and sorting", async () => {
      // Create sample votes with default filter values
      const vote1 = new Vote({
        user: "6519409a119e9770069f9f4a",
        profile: "6519404f119e9770069f9f3e",
        title: "Vote 1",
        description: "Description 1",
        mbti: "ESTJ",
        enneagram: "1w2",
        zodiac: "Aries",
        likes: [],
      });

      const vote2 = new Vote({
        user: "6519409a119e9770069f9f42",
        profile: "6519404f119e9770069f9f32",
        title: "Vote 2",
        description: "Description 2",
        mbti: "INFJ",
        enneagram: "5w4",
        zodiac: "Scorpio",
        likes: [],
      });

      await Vote.insertMany([vote1, vote2]);

      const response = await request(app).get("/api/votes");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 2);
    });
  });
});
