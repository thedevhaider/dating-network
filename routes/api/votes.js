"use strict";

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Load B=Vote Validations
const validateVoteInput = require("../../validation/vote");

// Load Like Validations
const validateLikeInput = require("../../validation/like");

// Load Profile Model
const Profile = require("../../models/Profile");

// Load User Model
const User = require("../../models/User");
const Vote = require("../../models/Vote");

// @routes     GET api/votes/test
// @desc       Tests vote routes
// @access     Public
router.get("/test", (req, res) => res.json({ vote: "Vote Working" }));

// @routes     POST /api/votes
// @desc       Vote a profile
// @access     Public
router.post("/", function (req, res) {
  // Validate Vote Fields
  const { errors, isValid } = validateVoteInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Check if the provided user exists as we not using auth
  User.findOne({ _id: req.body.user })
    .then((user) => {
      if (!user) {
        res.status(404).json({ no_user_found: "No user found" });
      } else {
        // Check if profile exists
        Profile.findOne({ _id: req.body.profile })
          .then((profile) => {
            if (!profile) {
              res.status(404).json({ no_profile_found: "No profile found" });
            } else {
              // Get Fields
              const voteFields = {};
              voteFields.user = req.body.user;
              voteFields.description = req.body.description;
              voteFields.title = req.body.title;
              voteFields.mbti = req.body.mbti;
              voteFields.enneagram = req.body.enneagram;
              voteFields.zodiac = req.body.zodiac;
              voteFields.profile = req.body.profile;
              if (req.body.image) voteFields.image = req.body.image;

              // Check if a vote is already given by this user to this profile
              Vote.findOne({ user: req.body.user, profile: req.body.profile })
                .then((vote) => {
                  if (vote) {
                    // Vote already exists
                    res.status(400).json({
                      vote_exists:
                        "Vote already exists for this profile from provided user",
                    });
                  } else {
                    // Vote does not exists, create vote
                    new Vote(voteFields)
                      .save()
                      .then((vote) => {
                        res.status(201).json(vote);
                      })
                      .catch((err) => res.json(err));
                  }
                })
                .catch((err) => {
                  errors.error = "There was an issue while fetching the vote";
                  res.status(500).json(errors);
                });
            }
          })
          .catch((err) => {
            errors.error = "There was an issue while fetching the profile";
            res.status(500).json(errors);
          });
      }
    })
    .catch((err) => {
      errors.error = "There was an issue while fetching the user";
      res.status(500).json(errors);
    });
});

// @routes     POST api/votes/like/:id
// @desc       Like vote
// @access     Public
router.post("/like/:id", (req, res) => {
  // Validate Vote Fields
  const { errors, isValid } = validateLikeInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Check if the provided user exists as we not using auth
  User.findOne({ _id: req.body.user })
    .then((user) => {
      if (!user) {
        res.status(404).json({ no_user_found: "No user found" });
      } else {
        // Check if vote exists
        Vote.findOne({ _id: req.params.id })
          .then((vote) => {
            if (!vote) {
              res.status(404).json({ no_vote_found: "No vote found" });
            } else {
              // Check if already liked the vote
              if (
                vote.likes.filter(
                  (like) => like.user.toString() === req.body.user
                ).length > 0
              ) {
                return res.status(400).json({
                  already_liked: "You have already liked this post",
                });
              }

              // Like the vote
              vote.likes.unshift({ user: req.body.user });

              // Save to db
              vote.save().then((vote) => res.json(vote));
            }
          })
          .catch((err) => {
            errors.error = "There was an issue while fetching the vote";
            return res.status(500).json(errors);
          });
      }
    })
    .catch((err) => {
      errors.error = "There was an issue while fetching the user";
      return res.status(500).json(errors);
    });
});

// @routes     POST api/votes/unlike/:id
// @desc       Unlike vote
// @access     Public
router.post("/unlike/:id", (req, res) => {
  // Validate Vote Fields
  const { errors, isValid } = validateLikeInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Check if the provided user exists as we not using auth
  User.findOne({ _id: req.body.user })
    .then((user) => {
      if (!user) {
        res.status(404).json({ no_user_found: "No user found" });
      } else {
        // Check if vote exists
        Vote.findOne({ _id: req.params.id })
          .then((vote) => {
            if (!vote) {
              res.status(404).json({ no_vote_found: "No vote found" });
            } else {
              // Check if not liked the vote
              if (
                vote.likes.filter(
                  (like) => like.user.toString() === req.body.user
                ).length === 0
              ) {
                return res
                  .status(400)
                  .json({ not_liked: "You have not liked this post" });
              }

              // Find the like index
              const removeIndex = vote.likes
                .map((item) => item.user.toString())
                .indexOf(req.body.user);

              // Splicing it from the likes array
              vote.likes.splice(removeIndex, 1);

              // Saving to db
              vote.save().then((vote) => res.json(vote));
            }
          })
          .catch((err) => {
            errors.error = "There was an issue while fetching the vote";
            return res.status(500).json(errors);
          });
      }
    })
    .catch((err) => {
      errors.error = "There was an issue while fetching the user";
      return res.status(500).json(errors);
    });
});

// @routes     GET api/votes/
// @desc       Get all votes
// @access     Public
router.get("/", (req, res) => {
  let errors = {};
  try {
    // Extract query parameters with default values
    const {
      sortBy = "recent",
      filterByMbti = "",
      filterByEnneagram = "",
      filterByZodiac = "",
      page = 1,
      perPage = 10,
      profile = "", // Number of items per page
    } = req.query;

    // Calculate skip and limit for pagination
    const skip = (page - 1) * perPage;
    const limit = perPage;

    // Create an aggregation pipeline
    const pipeline = [];

    // Stage 1: Match documents based on filter criteria
    const matchStage = {};

    // Check if provided profile id is valid
    if (profile) {
      // Add profile ID filter if a valid ObjectId is provided
      if (mongoose.Types.ObjectId.isValid(profile)) {
        matchStage.profile = new mongoose.Types.ObjectId(profile);
      } else {
        return res
          .status(400)
          .json({ profile: "profile should have exact 24 characters" });
      }
    }
    if (filterByMbti) {
      matchStage.mbti = filterByMbti;
    }
    if (filterByEnneagram) {
      matchStage.enneagram = filterByEnneagram;
    }
    if (filterByZodiac) {
      matchStage.zodiac = filterByZodiac;
    }
    pipeline.push({ $match: matchStage });

    // Stage 2: Add a field for likes count
    pipeline.push({
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    });

    // Stage 3: Sort documents based on sorting criteria
    const sortStage = {};
    if (sortBy === "recent") {
      sortStage.date = -1; // Sort by date in descending order (most recent first)
    } else if (sortBy === "best") {
      sortStage.likesCount = -1; // Sort by likesCount in descending order (most likes first)
    }
    pipeline.push({ $sort: sortStage });

    // Stage 4: Pagination using $skip and $limit
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Make a call based on query and sort criteria
    Vote.aggregate(pipeline)
      .exec()
      .then((votes) => {
        if (!votes || votes.length == 0) {
          res.status(404).json({ no_votes_found: "No votes found" });
        } else {
          res.json(votes);
        }
      })
      .catch((err) => {
        errors.error = "There was an issue while fetching the votes";
        return res.status(500).json(errors);
      });
  } catch (error) {
    errors.error = "There was an issue while fetching the votes";
    return res.status(500).json(errors);
  }
});

// @routes     GET api/votes/options
// @desc       Get all voting options
// @access     Public
router.get("/options", (req, res) => {
  const mbti = [
    "ESTJ",
    "ENTJ",
    "ESFJ",
    "ENFJ",
    "ISTJ",
    "ISFJ",
    "INTJ",
    "INFJ",
    "ESTP",
    "ESFP",
    "ENTP",
    "ENFP",
    "ISTP",
    "ISFP",
    "INTP",
    "INFP",
  ];
  const enneagram = [
    "1w2",
    "2w3",
    "3w2",
    "3w4",
    "4w3",
    "4w5",
    "5w4",
    "5w6",
    "6w5",
    "6w7",
    "7w6",
    "7w8",
    "8w7",
    "8w9",
    "9w8",
    "9w1",
  ];
  const zodiac = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const voting_options = {
    mbti: mbti,
    enneagram: enneagram,
    zodiac: zodiac,
  };
  res.status(200).json(voting_options);
});

module.exports = router;
