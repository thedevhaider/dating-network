const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.user = !isEmpty(data.user) ? data.user : "";

  if (!Validator.isLength(data.name, { min: 2, max: 100 })) {
    errors.name = "name must be 2 to 100 characters long";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "name required";
  }

  if (!Validator.isLength(data.description, { min: 10, max: 1000 })) {
    errors.description = "description must be 100 to 1000 characters long";
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = "description required";
  }

  if (!Validator.isLength(data.user, { min: 24, max: 24 })) {
    errors.user = "user must be 24 characters long";
  }

  if (Validator.isEmpty(data.user)) {
    errors.user = "user required";
  }

  if (!isEmpty(data.mbti)) {
    if (!Validator.isLength(data.mbti, { min: 4, max: 4 })) {
      errors.mbti = "mbti must be 4 characters long";
    }
  }

  if (!isEmpty(data.enneagram)) {
    if (!Validator.isLength(data.enneagram, { min: 3, max: 3 })) {
      errors.enneagram = "enneagram must be 3 characters long";
    }
  }

  if (!isEmpty(data.variant)) {
    if (!Validator.isLength(data.variant, { min: 5, max: 5 })) {
      errors.variant = "variant must be 5 characters long";
    }
  }

  if (data.tritype !== "undefined" && data.tritype !== null) {
    if (data.tritype < 100 || data.tritype > 999) {
      errors.tritype = "tritype must be of value from 100 to 999";
    }
  }

  if (!isEmpty(data.socionics)) {
    if (!Validator.isLength(data.socionics, { min: 3, max: 3 })) {
      errors.socionics = "socionics must be 3 characters long";
    }
  }

  if (!isEmpty(data.sloan)) {
    if (!Validator.isLength(data.sloan, { min: 5, max: 5 })) {
      errors.sloan = "sloan must be 5 characters long";
    }
  }

  if (!isEmpty(data.psyche)) {
    if (!Validator.isLength(data.psyche, { min: 4, max: 4 })) {
      errors.psyche = "psyche must be 4 characters long";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
