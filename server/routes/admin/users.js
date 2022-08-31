const express = require("express");
const router = express.Router();
const Joi = require("joi");
const UserAdminManager = require("../../manager-admin/UserAdminManager");
const userAdminManager = UserAdminManager();
const { checkAdminAuthorizationToken } = require("../../module/authorize");

// Admin routes for user

// Select Users
router.get("/", checkAdminAuthorizationToken, async (req, res) => {
  userAdminManager
    .getUsers()
    .then((userResult) => res.json(userResult))
    .catch((error) => {
      res.json([]);
    });
});

router.get(
  "/search/:search_text",
  checkAdminAuthorizationToken,
  async (req, res) => {
    const search =
      req.params.search_text == null ? "" : req.params.search_text.trim();
    let scheme = Joi.object({
      search_text: Joi.string().min(3).required(),
    });

    let sResult = scheme.validate({ search_text: search });

    if (sResult.error !== undefined) {
      res.json([]);
      return;
    }

    userAdminManager
      .getUserSearch(search)
      .then((userResult) => res.json(userResult))
      .catch((error) => {
        res.json([]);
      });
  }
);

// Select User
router.get("/:id", checkAdminAuthorizationToken, async (req, res) => {
  let iObject = { id: req.params.id };
  let scheme = Joi.object({
    id: Joi.number().integer().required(),
  });

  let sResult = scheme.validate(iObject);

  if (sResult.error !== undefined) {
    res.json({ status: "error", message: sResult.error.details[0].message });
    return;
  }

  userAdminManager
    .getUser(iObject.id)
    .then((userResult) => res.json(userResult))
    .catch((error) => res.json(null));
});

// Insert User
router.post("/", checkAdminAuthorizationToken, async (req, res) => {
  let scheme = Joi.object({
    first_name: Joi.string().min(1).required(),
    lastname: Joi.string().min(1).required(),
    user_name: Joi.string().min(1).required(),
    password: Joi.string().min(1).required(),
    email_address: Joi.string().email().max(250).required(),
    contact_number: Joi.string().min(1).required(),
    user_type_id: Joi.number().integer().min(1).max(2).required(),
    locked: Joi.boolean().optional().empty(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({ status: "error", message: sResult.error.details[0].message });
    return;
  }

  const iObject = {
    first_name: req.body.first_name,
    lastname: req.body.lastname,
    user_name: req.body.user_name,
    password: bcrypt.hashSync(req.body.password, 10),
    email_address: req.body.email_address,
    contact_number: req.body.contact_number,
    user_type_id: req.body.user_type_id,
  };

  userAdminManager
    .addUser(iObject)
    .then((result) =>
      res.json({
        status: result > 0 ? "success" : "error",
        message: result > 0 ? "New User added" : "Could not add user",
      })
    )
    .catch((error) =>
      res.json({ status: "error", message: "Could not add user" })
    );
});

// Update User
router.put("/", checkAdminAuthorizationToken, async (req, res) => {
  let scheme = Joi.object({
    id: Joi.number().integer().required(),
    first_name: Joi.string().min(1).required(),
    lastname: Joi.string().min(1).required(),
    user_name: Joi.string().min(1).required(),
    email_address: Joi.string().min(1).required(),
    contact_number: Joi.string().min(1).required(),
    user_type_id: Joi.number().integer().required(),
    locked: Joi.bool().required(),
  });

  let sResult = scheme.validate(req.body);

  if (sResult.error !== undefined) {
    res.json({ status: "error", message: sResult.error.details[0].message });
    return;
  } else if (req.body.id == req.user.user_id) {
    res.json({ status: "error", message: "Cannot edit your own Account" });
    return;
  }

  let iObject = {
    id: req.body.id,
    first_name: req.body.first_name,
    lastname: req.body.lastname,
    user_name: req.body.user_name,
    email_address: req.body.email_address,
    contact_number: req.body.contact_number,
    user_type_id: req.body.user_type_id,
    locked: req.body.locked,
  };

  userAdminManager
    .updateUser(iObject)
    .then((addResult) =>
      res.json({
        status: addResult > 0 ? "success" : "error",
        message:
          addResult > 0
            ? "User updated"
            : "Could not update user / User not found",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not udpate user / User not found",
      })
    );
});

// Delete User
router.delete("/:user_id", checkAdminAuthorizationToken, async (req, res) => {
  let { user_id } = req.params;
  let scheme = Joi.object({
    id: Joi.number().integer().required(),
  });

  let sResult = scheme.validate({ id: user_id });

  if (sResult.error !== undefined) {
    res.json({ status: "error", message: sResult.error.details[0].message });
    return;
  } else if (user_id == req.user.user_id) {
    res.json({ status: "error", message: "Cannot remove your own Account" });
    return;
  }

  const userHasOrder = await orderAdminManager.userOrdered(user_id);

  if (userHasOrder != null && userHasOrder.count > 0) {
    res.json({
      status: "error",
      message: "Cannot remove a user who has a order history",
    });

    return;
  }

  userAdminManager
    .deleteUser(user_id)
    .then((result) =>
      res.json({
        status: result > 0 ? "success" : "error",
        message:
          result > 0
            ? "User deleted"
            : "Could not delete user / User not found",
      })
    )
    .catch((error) =>
      res.json({
        status: "error",
        message: "Could not delete user / User not found",
      })
    );
});

// Reset Password
router.put(
  "/password/reset/:id",
  checkAdminAuthorizationToken,
  async function (req, res) {
    let iObject = { id: req.params.id };
    let scheme = Joi.object({
      id: Joi.number().integer().required(),
    });

    let sResult = scheme.validate(iObject);

    if (sResult.error !== undefined) {
      res.json({ status: "error", message: sResult.error.details[0].message });
      return;
    } else if (iObject.id == req.user.user_id) {
      res.json({ status: "error", message: "Cannot remove your own Account" });
      return;
    }

    const user = await userManager.getUserByID(iObject.id);

    if (user != null) {
      const encrypted_password = bcrypt.hashSync(user.user_name, 10);
      userManager
        .updatePassword(encrypted_password, iObject.id)
        .then((updateStatus) =>
          res.json({
            status: updateStatus > 0 ? "success" : "error",
            message:
              updateStatus > 0
                ? "Password reset to : " + user.user_name
                : "Could not update password",
          })
        )
        .catch((error) =>
          res.json({
            status: "error",
            message: "Could not update password",
          })
        );
    } else {
      res.json({
        status: "error",
        message: "Could not update password / User not found",
      });
    }
  }
);

router.put(
  "/:user_id/password",
  checkAdminAuthorizationToken,
  async function (req, res) {
    let iObject = {
      user_id: req.params.user_id,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
    };

    let scheme = Joi.object({
      user_id: Joi.number().integer().required(),
      confirm_password: Joi.string().min(5).max(15).required(),
      password: Joi.string().min(5).max(15).required(),
    });

    let sResult = scheme.validate(iObject);

    if (sResult.error !== undefined) {
      res.json({ status: "error", message: sResult.error.details[0].message });
      return;
    } else if (iObject.password != iObject.confirm_password) {
      res.json({
        status: "error",
        message: "Both passwords must match",
      });
    }

    const encrypted_password = bcrypt.hashSync(iObject.password, 10);
    userManager
      .updatePassword(encrypted_password, iObject.user_id)
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
  }
);

module.exports = router;