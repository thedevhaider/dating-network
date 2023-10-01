const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateVoteInput(data) {
  let errors = {};

  data.user = !isEmpty(data.user) ? data.user : "";

  if (!Validator.isLength(data.user, { min: 24, max: 24 })) {
    errors.user = "user must be 24 characters long";
  }

  if (Validator.isEmpty(data.user)) {
    errors.user = "user required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
