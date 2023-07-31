const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");
const queries = require("../db/queries");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const logger = require("../logger");

async function login(req, res) {
  var userCredits = 10;
  const loginMetod = req.headers["login-type"]; // moraju mala slova, opcije: google || standard
  if (loginMetod === "google") {
    const clientId = req.body.clientId;
    const credential = req.body.credential;
    const client = new OAuth2Client(clientId);
    try {
      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      // Generate a JWT token
      const token = jwt.sign(
        { sub: payload.sub, email: payload.email },
        process.env.TOKEN_SECRET_KEY, // secretId dobio od google
        { expiresIn: "7d" }
      );

      const checkEmail = await pool.query(queries.checkEmailExists, [
        payload.email,
      ]);

      if (checkEmail.rows.length === 0) {
        try {
          const googleHash = await bcrypt.hash("fGhte1", SALT_ROUNDS);
          await pool.query(queries.addUserGoogle, [
            payload.email,
            googleHash,
            "google",
            req.body.referral,
          ]);
          await pool.query(queries.addCreditsForEmail, [
            payload.email,
            userCredits,
          ]);
          console.log("Google email added to database.");
        } catch (err) {
          console.error(err.message);
        }
      } else {
        // Google email already exists!
        const userCred = await pool.query(queries.getUserCredits, [
          payload.email,
        ]);
        userCredits = userCred.rows[0].quantity;
      }
      logger.logUserLogin(payload.email);
      return res.status(200).send(
        JSON.stringify({
          token: token,
          email: payload.email,
          profilePic: payload.picture,
          availableCredits: userCredits,
        })
      );
    } catch (err) {
      console.error(err);
      res
        .status(401)
        .send(
          JSON.stringify({ err: err, msg: "Failed to login with google." })
        );
    }
  }

  if (loginMetod === "standard") {
    try {
      const checkEmailStandard = await pool.query(queries.checkEmailExists, [
        req.body.email,
      ]);

      if (checkEmailStandard.rows.length === 0) {
        try {
          const hashedPassword = await bcrypt.hash(
            req.body.password,
            SALT_ROUNDS
          );
          // TODO: nije provereno da li je jedinstveno
          const userToken = crypto.randomBytes(20).toString("hex");

          await pool.query(queries.addUserStandard, [
            req.body.email,
            hashedPassword,
            "standard",
            "false",
            userToken,
            req.body.referral,
          ]);

          const transporter = nodemailer.createTransport({
            service: "Gmail",
            secure: true,
            auth: {
              user: process.env.OUR_EMAIL,
              pass: process.env.OUR_EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: process.env.OUR_EMAIL,
            to: req.body.email,
            subject: "Email verification for TrueContento",
            text:
              "To verify your email, click on this link - " +
              process.env.SITE_ADDRESS +
              "/verify/" +
              userToken,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(
                "An error has occured while trying to send the verification email."
              );
              console.log(
                "Email used to send: " +
                  process.env.OUR_EMAIL +
                  ", with pass: " +
                  process.env.OUR_EMAIL_PASS
              );
              console.error(error.message);
              res.sendStatus(500);
            } else {
              logger.logUserInfo(
                req.body.email,
                "Verification email sent successfully."
              );
              console.log("Verification email sent successfully.");
              return res.sendStatus(403);
            }
          });
          logger.logUserLogin(payload.email);
          console.log(
            "New standard account created! Uses password: " +
              hashedPassword +
              " , and email: " +
              req.body.email
          );

          res.status(201).json({ email: req.body.email, userToken: userToken });
        } catch (err) {
          console.error(err.message);
        }
      } else {
        try {
          const checkIfGoogle = await pool.query(queries.checkIfGoogleEmail, [
            req.body.email,
            "google",
          ]);

          if (checkIfGoogle.rows.length === 1) {
            console.log("Account already exists as google account!");
            res
              .status(500)
              .send({ message: "Account already exists as google account!" });
          } else {
            try {
              const isSame = await bcrypt.compare(
                req.body.password,
                checkEmailStandard.rows[0].password
              );

              if (!isSame) {
                console.log("Credentials incorrect!");
                res.sendStatus(401);
              } else {
                try {
                  const checkIfVerified = await pool.query(
                    queries.checkIfVerified,
                    [req.body.email, "true"]
                  );
                  if (checkIfVerified.rows.length === 1) {
                    //TODO create token
                    console.log(
                      "Standard login correct - using password: " +
                        checkEmailStandard.rows[0].password +
                        " , and email: " +
                        req.body.email
                    );

                    const user = {
                      password: checkEmailStandard.rows[0].password,
                      email: req.body.email,
                    };

                    const token = jwt.sign(user, process.env.TOKEN_SECRET_KEY, {
                      expiresIn: "7d",
                    });
                    const userCred = await pool.query(queries.getUserCredits, [
                      req.body.email,
                    ]);
                    userCredits = userCred.rows[0].quantity;
                    res.status(200).json({
                      token: token,
                      email: req.body.email,
                      availableCredits: userCredits,
                    });
                  } else {
                    res.sendStatus(403);
                  }
                } catch (err) {
                  console.error(err.message);
                }
              }
            } catch (err) {
              console.error(err.message);
            }
          }
        } catch (err) {
          console.error(err.message);
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }
}

function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
    password: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

module.exports = login;
