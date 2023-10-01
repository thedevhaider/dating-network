const express = require("express");
const validateRegisterInput = require("../../validation/register");
const router = express.Router();

// Load the user model
const User = require("../../models/User.js");

// @routes     GET api/users/test
// @desc       Tests users routes
// @access     Public
router.get("/test", (req, res) => res.json({ user: "Users Working" }));

// @routes     POST api/users/register
// @desc       API to register user
// @access     Public
router.post("/register", (req, res) => {
  // Validate Register Inputs
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Find this request in the DB
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.user = "Already Exists";
      res.status(400).json(errors);
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
      });

      newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => console.log(err));
    }
  });
});

// @routes     GET api/users/:user_id
// @desc       Returns user from provided user id
// @access     Public
router.get("/:user_id", (req, res) => {
  const errors = {};
  User.findOne({ _id: req.params.user_id })
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ no_user_found: "No user found" });
      }
    })
    .catch((err) => {
      errors.error = "There was an issue while fetching the user";
      return res.status(500).json(errors);
    });
});

// @routes     GET api/users
// @desc       Get all users
// @access     Public
router.get("/", (req, res) => {
  User.find()
    .sort({ date: -1 })
    .then((users) => res.json(users))
    .catch((err) => res.status(404).json({ no_users_found: "No users found" }));
});

module.exports = router;
