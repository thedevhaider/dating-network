const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../app");
const Profile = require("../../../models/Profile");
const User = require("../../../models/User");

chai.use(require("chai-http"));

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

describe("Profile Routes", () => {
  beforeEach(async () => {
    // Clear the Profile and User collections before each test
    await Profile.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /api/profile/test", () => {
    it("should return a JSON object with 'profile' property", async () => {
      const res = await request(app).get("/api/profile/test");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("profile").to.equal("Profile Working");
    });
  });

  describe("GET /:profile_id", () => {
    it("should return a profile by profile_id if it exists", async () => {
      const user = await createUser("Test User", "test@example.com");
      const profileData = {
        name: "Test Profile",
        description: "Test description",
      };
      const newProfile = await createProfile(user, profileData);

      const res = await request(app).get(`/${newProfile._id}`);
      expect(res.status).to.equal(200);
    });

    it("should return a 404 error if the profile_id does not exist", async () => {
      const invalidProfileId = "6518240fec3abac1f6b02a9d";

      const res = await request(app).get(`/${invalidProfileId}`);
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an("object");
      expect(res.body)
        .to.have.property("no_profile")
        .to.equal("No profile found for this provided id");
    });
  });

  describe("POST /api/profile", () => {
    it("should create or update a user profile and return the profile data", async () => {
      // Create a user in the test database
      const user = await createUser("Test User", "test@example.com");

      // Define the profile data to send in the request
      const profileData = {
        user: user._id, // Use the user ID
        name: "Test Profile",
        description: "Test description",
        // Include other profile fields as needed
      };

      // Send a POST request to create/update the profile
      const res = await request(app).post("/api/profile").send(profileData);

      // Check the response status and structure
      expect(res.status).to.equal(201); // HTTP status code for "Created"
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("name").to.equal(profileData.name);
      expect(res.body)
        .to.have.property("description")
        .to.equal(profileData.description);

      // Check if the profile was created or updated in the test database
      const updatedProfile = await Profile.findOne({ user: user._id });
      expect(updatedProfile).to.not.be.null;
      expect(updatedProfile.name).to.equal(profileData.name);
      expect(updatedProfile.description).to.equal(profileData.description);
    });

    it("should return a 404 error if the provided user does not exist", async () => {
      // Define profile data with a non-existing user ID
      const profileData = {
        user: "6518240fec3abac1f6b02a9d",
        name: "Test Profile",
        description: "Test description",
        // Include other profile fields as needed
      };

      // Send a POST request to create/update the profile
      const res = await request(app).post("/api/profile").send(profileData);

      // Check the response status and error message
      expect(res.status).to.equal(404); // HTTP status code for "Not Found"
      expect(res.body).to.be.an("object");
      expect(res.body)
        .to.have.property("no_user_found")
        .to.equal("No user found");

      // Ensure that no profile was created in the test database
      const noProfile = await Profile.findOne({ user: profileData.user });
      expect(noProfile).to.be.null;
    });
  });
});
