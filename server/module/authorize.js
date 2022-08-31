const jwt = require("jsonwebtoken");

/// Secret Constants
const jwt_key = process.env.ACCESS_TOKEN_SECRET || "";

/////////////////////////////////////////////////////////

/**
 * Checks if request has a valid token
 * @param {*} req Takes in the request object
 * @param {*} res Takes in the reponse object
 * @param {*} next
 * @returns
 */
function checkAuthorizationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ");

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token[0], jwt_key, (err, user) => {
    if (!err) {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
}

/**
 * Checks if request has a valid admin token
 * @param {*} req Takes in the request object
 * @param {*} res Takes in the reponse object
 * @param {*} next
 * @returns
 */
function checkAdminAuthorizationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ");

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token[0], jwt_key, (err, user) => {
    if (!err && user.user_type == "admin") {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
}

/**
 *
 * @param {*} user If the user is an admin generate a 24 hour token otherwise it is a 5 hour token
 * @returns returns generated web token
 */
function generateToken(user) {
  return jwt.sign(user, jwt_key, {
    expiresIn: user.user_type == "admin" ? "24h" : "5h",
  });
}

module.exports = {
  checkAdminAuthorizationToken,
  checkAuthorizationToken,
  generateToken,
};