const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const CustomerManager = require("../../manager/customer-manager");
const userManager = CustomerManager();

const { generateToken } = require("../../module/authorize");

router.post("/login", async function (req, res) {
  const { user_name, password } = req.body;

  let scheme = Joi.object({
    user_name: Joi.string().alphanum().min(5).max(25).required(),
    password: Joi.string().min(5).max(15).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
      token: "",
    });

    return;
  }

  userManager
    .getUserByUserName(user_name)
    .then((user_account) => {
      if (bcrypt.compareSync(password, user_account.password)) {
        const user = {
          user_id: user_account.id,
          first_name: user_account.first_name,
          lastname: user_account.lastname,
          user_type: user_account.user_type_id == 1 ? "customer" : "admin",
        };
        const accessKey = generateToken(user);

        res.json({
          status: "success",
          message: "Login was successful",
          token: accessKey,
        });
      } else {
        res.json({
          status: "error",
          message: "User could not be found, wrong user name or password",
          token: "",
        });
      }
    })
    .catch((error) => {
      res.json({
        status: "error",
        message: "User could not be found, wrong user name or password",
        token: "",
      });
    });
});

router.post("/signup", async function (req, res) {
  const {
    user_name,
    password,
    first_name,
    lastname,
    contact_number,
    email_address,
  } = req.body;

  let scheme = Joi.object({
    user_name: Joi.string().alphanum().min(5).max(25).required(),
    password: Joi.string().min(5).max(15).required(),
    first_name: Joi.string().min(2).max(50).required(),
    lastname: Joi.string().min(2).max(50).required(),
    contact_number: Joi.string().min(10).max(13).empty("").optional(),
    email_address: Joi.string().email().min(10).max(128).empty("").optional(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
      token: "",
    });

    return;
  }

  let user_account = await userManager.getUserByUserName(user_name);

  if (user_account != null && user_account.id != null) {
    res.json({
      status: "error",
      message: "Account aleady exists",
    });
    return;
  }

  const encrypted_password = bcrypt.hashSync(password, 10);
  const result = await userManager.registerUser(
    first_name,
    lastname,
    encrypted_password,
    user_name,
    email_address,
    contact_number,
    1
  );

  if (result > 0) {
    user_account = await userManager.getUserByUserName(user_name);
    const user = {
      user_id: user_account.id,
      first_name: first_name,
      lastname: lastname,
      user_type: user_account.user_type_id == 1 ? "customer" : "admin",
    };
    const accessKey = generateToken(user);
    res.json({
      status: "success",
      message: "Signup success",
      token: accessKey,
    });
  } else {
    res.json({
      status: "error",
      message: "Could not sign up user",
    });
  }
});

router.post("/admin/login", async function (req, res) {
  const { user_name, password } = req.body;

  let scheme = Joi.object({
    user_name: Joi.string().alphanum().min(5).max(25).required(),
    password: Joi.string().min(5).max(15).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
      token: "",
    });

    return;
  }

  userManager
    .getUserByUserName(user_name)
    .then((user_account) => {
      if (
        bcrypt.compareSync(password, user_account.password) &&
        user_account.user_type_id == 2
      ) {
        const user = {
          user_id: user_account.id,
          first_name: user_account.first_name,
          lastname: user_account.lastname,
          user_type: "admin",
        };
        const accessKey = generateToken(user);

        res.json({
          status: "success",
          message: "Login was successful",
          token: accessKey,
        });
      } else {
        res.json({
          status: "error",
          message: "User could not be found, wrong user name or password",
          token: "",
        });
      }
    })
    .catch((error) => {
      res.json({
        status: "error",
        message: "User could not be found, wrong user name or password",
        token: "",
      });
    });
});

module.exports = router;