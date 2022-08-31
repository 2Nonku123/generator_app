const express = require("express");
const router = express.Router();
const { checkAdminAuthorizationToken } = require("../../module/authorize");

const UserAdminManager = require("../../manager-admin/UserAdminManager");
const userAdminManager = UserAdminManager();

router.get("/stats", checkAdminAuthorizationToken, async function (req, res) {
  userAdminManager
    .getStats()
    .then((addressData) => res.json(addressData))
    .catch((error) => res.json({}));
});

module.exports = router;