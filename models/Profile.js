const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mbti: {
    type: String,
  },
  enneagram: {
    type: String,
  },
  variant: {
    type: String,
  },
  tritype: {
    type: Number,
  },
  socionics: {
    type: String,
  },
  sloan: {
    type: String,
  },
  psyche: {
    type: String,
  },
  temperaments: {
    type: String,
  },
  image: {
    type: String,
  },
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
