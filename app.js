"use strict";

const express = require("express");
const mongoose = require("mongoose");
const profile = require("./routes/api/profile");
const users = require("./routes/api/users");
const votes = require("./routes/api/votes");
const bodyParser = require("body-parser");
const { MongoMemoryServer } = require("mongodb-memory-server");

const PORT = process.env.PORT || 3000;

const app = express();

// Adding middleware to express app
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

(async () => {
  let mongoServer = await MongoMemoryServer.create();
  let mongoUri = mongoServer.getUri();

  console.log("Connection URL: ", mongoUri);

  // Connect to MongoDB using Mongoose
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to In-Memory MongoDB"))
    .catch((err) => console.log(err, "Error"));
})();

// set the view engine to ejs
app.set("view engine", "ejs");

// routes
app.use("/", profile);
app.use("/api/users", users);
app.use("/api/votes", votes);

// start server
module.exports = app.listen(PORT, () =>
  console.log(`Running server on Port ${PORT}`)
);
