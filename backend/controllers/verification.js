const pool = require("../db/db");
const queries = require("../db/queries");
const logger = require("../logger");

async function verify(req, res, next) {
  try {
    const token = req.params.userToken;
    const userCredits = 10;
    const userWithToken = await pool.query(queries.checkTokenExists, [token]);
    if (userWithToken.rows.length === 0) {
      console.log("User with this token does not exist.");
    } else {
      await pool.query(queries.updateVerificationStatus, ["true", token]);
      await pool.query(queries.addCreditsForEmail, [
        userWithToken.rows[0].email,
        userCredits,
      ]);
      logger.logUserAction(userWithToken.rows[0].email, "user verified");
      console.log("User successfully verified!");
      res.redirect("/auth.html");
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get user" });
  }
}

module.exports = {
  verify,
};
