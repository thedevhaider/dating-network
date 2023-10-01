"use strict";

const express = require("express");
const router = express.Router();

// Load Profile Validations
const validateProfileInput = require("../../validation/profile");

// Load Profile Model
const Profile = require("../../models/Profile");

// Load User Model
const User = require("../../models/User");

// @routes     GET api/profile/test
// @desc       Tests profile routes
// @access     Public
router.get("/api/profile/test", (req, res) =>
  res.json({ profile: "Profile Working" })
);

// @routes     GET /:profile_id
// @desc       Get profile by profile_id
// @access     Public
router.get("/:profile_id", function (req, res) {
  const errors = {};
  Profile.findOne({ _id: req.params.profile_id })
    .populate("user", ["name", "email"])
    .then((profile) => {
      if (!profile) {
        errors.no_profile = "No profile found for this provided id";
        return res.status(404).json(errors);
      }
      res.render("profile_template", { profile: profile });
    })
    .catch((err) => {
      errors.error = "There was an issue while fetching the profile";
      return res.status(500).json(errors);
    });
});

// @routes     GET api/profile/all
// @desc       Get all profiles
// @access     Public
router.get("/api/profile/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "email"])
    .then((profiles) => {
      if (!profiles) {
        errors.no_profiles = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.status(200).json(profiles);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// @routes     POST /api/profile
// @desc       Create or Update User profile
// @access     Public
router.post("/api/profile/", function (req, res) {
  // Validate Profile Fields
  const { errors, isValid } = validateProfileInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Check if the provided user exists as we not using auth
  User.findOne({ _id: req.body.user })
    .then((user) => {
      if (!user) {
        res.status(404).json({ no_user_found: "No user found" });
      } else {
        // Get Fields
        const profileFields = {};
        profileFields.user = req.body.user;
        profileFields.name = req.body.name;
        profileFields.description = req.body.description;

        if (req.body.mbti) profileFields.mbti = req.body.mbti;
        if (req.body.enneagram) profileFields.enneagram = req.body.enneagram;
        if (req.body.variant) profileFields.variant = req.body.variant;
        if (req.body.tritype) profileFields.tritype = req.body.tritype;
        if (req.body.socionics) profileFields.socionics = req.body.socionics;
        if (req.body.sloan) profileFields.sloan = req.body.sloan;
        if (req.body.psyche) profileFields.psyche = req.body.psyche;
        if (req.body.temperaments)
          profileFields.temperaments = req.body.temperaments;
        if (req.body.image) profileFields.image = req.body.image;

        // Search for User Profile
        Profile.findOne({ user: req.body.user })
          .then((profile) => {
            if (profile) {
              // Updating profile as it exists
              Profile.findOneAndUpdate(
                { user: req.body.user },
                { $set: profileFields },
                { new: true }
              )
                .then((profile) => {
                  res.status(200).json(profile);
                })
                .catch((err) => res.json(err));
            } else {
              // Save Profile
              new Profile(profileFields)
                .save()
                .then((profile) => {
                  res.status(201).json(profile);
                })
                .catch((err) => res.json(err));
            }
          })
          .catch((err) => {
            res.json(err);
          });
      }
    })
    .catch((err) => {
      errors.error = "There was an issue while fetching the user";
      return res.status(500).json(errors);
    });
});

module.exports = router;
