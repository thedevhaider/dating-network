const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateVoteInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.mbti = !isEmpty(data.mbti) ? data.mbti : "";
  data.enneagram = !isEmpty(data.enneagram) ? data.enneagram : "";
  data.zodiac = !isEmpty(data.zodiac) ? data.zodiac : "";
  data.user = !isEmpty(data.user) ? data.user : "";
  data.profile = !isEmpty(data.profile) ? data.profile : "";

  if (!Validator.isLength(data.title, { min: 2, max: 30 })) {
    errors.title = "title must be 2 to 30 Characters long";
  }

  if (Validator.isEmpty(data.title)) {
    errors.title = "title is required";
  }

  if (!Validator.isLength(data.description, { min: 10, max: 1000 })) {
    errors.description = "description must be 10 to 1000 Characters long";
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = "description is required";
  }

  if (!Validator.isLength(data.mbti, { min: 4, max: 4 })) {
    errors.mbti = "mbti must be 4 characters long";
  }

  if (Validator.isEmpty(data.mbti)) {
    errors.mbti = "mbti is required";
  }

  if (!Validator.isLength(data.enneagram, { min: 3, max: 3 })) {
    errors.enneagram = "enneagram must be 3 characters long";
  }

  if (Validator.isEmpty(data.enneagram)) {
    errors.enneagram = "enneagram is required";
  }

  if (Validator.isEmpty(data.zodiac)) {
    errors.zodiac = "zodiac is required";
  }

  if (!Validator.isLength(data.user, { min: 24, max: 24 })) {
    errors.user = "user must be 24 characters long";
  }

  if (Validator.isEmpty(data.user)) {
    errors.user = "user required";
  }

  if (!Validator.isLength(data.profile, { min: 24, max: 24 })) {
    errors.profile = "profile must be 24 characters long";
  }

  if (Validator.isEmpty(data.profile)) {
    errors.profile = "profile required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
