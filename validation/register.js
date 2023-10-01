const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "name must be 2 to 30 Characters long";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "name is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Incorrect Email";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "email is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
