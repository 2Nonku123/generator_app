const express = require("express");
const router = express.Router();
const Joi = require("joi");
const CustomerManager = require("../../manager/customer-manager");
const userManager = CustomerManager();
const { checkAuthorizationToken } = require("../../module/authorize");

router.get("/", checkAuthorizationToken, async function (req, res) {
  userManager
    .getProfile(req.user.user_id)
    .then((profileInfo) => res.json(profileInfo))
    .catch((error) =>
      res.json({ status: "error", message: "Could not load profile" })
    );
});

router.put("/personal", checkAuthorizationToken, async function (req, res) {
  const { first_name, lastname } = req.body;

  let scheme = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    lastname: Joi.string().min(2).max(50).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }

  userManager
    .updateUserPersonal(first_name, lastname, req.user.user_id)
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message:
          updateStatus > 0
            ? "Personal information updated"
            : "Could not update personal information",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not update personal information",
      })
    );
});

router.put("/contact", checkAuthorizationToken, async function (req, res) {
  const { contact_number, email_address } = req.body;

  let scheme = Joi.object({
    contact_number: Joi.string().min(10).max(13).empty("").optional(),
    email_address: Joi.string().email().min(10).max(128).empty("").optional(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }

  userManager
    .updateUserContact(email_address, contact_number, req.user.user_id)
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message:
          updateStatus > 0
            ? "Contact information updated"
            : "Could not update contact information",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not update contact information",
      })
    );
});

router.put("/password", checkAuthorizationToken, async function (req, res) {
  const { password, confirm_password } = req.body;

  let scheme = Joi.object({
    confirm_password: Joi.string().min(5).max(15).required(),
    password: Joi.string().min(5).max(15).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  } else if (password != confirm_password) {
    res.json({
      status: "error",
      message: "Both passwords must match",
    });

    return;
  }
  const encrypted_password = bcrypt.hashSync(password, 10);
  userManager
    .updatePassword(encrypted_password, req.user.user_id)
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message:
          updateStatus > 0 ? "Password updated" : "Could not update password",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not update password",
      })
    );
});

router.get("/address", checkAuthorizationToken, async function (req, res) {
  userManager
    .getAddressAll(req.user.user_id)
    .then((addressData) => res.json(addressData))
    .catch((error) => res.json([]));
});

router.get(
  "/address/:address_id",
  checkAuthorizationToken,
  async function (req, res) {
    const { address_id } = req.params;

    let scheme = Joi.object({
      address_id: Joi.number().min(1).required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    userManager
      .getAddress(address_id, req.user.user_id)
      .then((addressData) =>
        res.json({
          status: addressData != null ? "success" : "error",
          message: addressData != null ? "" : "Could not find address",
          address: addressData,
        })
      )
      .catch((error) =>
        res.json({ status: "error", message: "Could not find address" })
      );
  }
);

router.post("/address", checkAuthorizationToken, async function (req, res) {
  const { housenumber, street, province, postal_code, suburb, city } = req.body;

  let scheme = Joi.object({
    id: Joi.number().empty().optional(),
    housenumber: Joi.number().min(0).max(99999).required(),
    street: Joi.string().min(3).max(200).required(),
    suburb: Joi.string().min(3).max(200).required(),
    city: Joi.string().min(3).max(200).required(),
    province: Joi.string().min(5).max(50).required(),
    postal_code: Joi.string().min(4).max(4).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }

  userManager
    .addAddress(
      housenumber,
      street,
      suburb,
      city,
      province,
      postal_code,
      req.user.user_id
    )
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message: updateStatus > 0 ? "Address added" : "Could not add address",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not add address",
      })
    );
});

router.put("/address", checkAuthorizationToken, async function (req, res) {
  const { housenumber, street, province, postal_code, suburb, city, id } =
    req.body;
  let scheme = Joi.object({
    id: Joi.number().required(),
    housenumber: Joi.number().min(0).max(99999).required(),
    street: Joi.string().min(3).max(200).required(),
    suburb: Joi.string().min(3).max(200).required(),
    city: Joi.string().min(3).max(200).required(),
    province: Joi.string().min(5).max(50).required(),
    postal_code: Joi.string().min(4).max(4).required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({
      status: "error",
      message: sResult.error.details[0].message,
    });

    return;
  }

  userManager
    .updateAddress(
      housenumber,
      street,
      suburb,
      city,
      province,
      postal_code,
      id,
      req.user.user_id
    )
    .then((updateStatus) =>
      res.json({
        status: updateStatus > 0 ? "success" : "error",
        message:
          updateStatus > 0 ? "Address updated" : "Could not update address",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not update address",
      })
    );
});

router.delete(
  "/address/:address_id",
  checkAuthorizationToken,
  async function (req, res) {
    const { address_id } = req.params;

    let scheme = Joi.object({
      address_id: Joi.number().min(1).required(),
    });

    let sResult = scheme.validate(req.params);

    if (sResult.error !== undefined) {
      res.json({
        status: "error",
        message: sResult.error.details[0].message,
      });

      return;
    }

    userManager
      .removeAddress(address_id, req.user.user_id)
      .then((updateStatus) =>
        res.json({
          status: updateStatus > 0 ? "success" : "error",
          message:
            updateStatus > 0 ? "Address removed" : "Could not find address",
        })
      )
      .catch((error) =>
        res.json({
          status: "error",
          message: "Could not find address",
        })
      );
  }
);

module.exports = router;