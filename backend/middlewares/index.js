const jwt = require("jsonwebtoken");
const pool = require("../db/db");
const queries = require("../db/queries");
const logger = require("../logger");

async function refreshToken(req, res, next) {
  const token = req.headers["authorization"];
  try {
    const decodedToken = jwt.decode(token, process.env.TOKEN_SECRET_KEY); // Dekodiranje tokena sa tajnim ključem
    // Provera isteka tokena
    const currentTimestamp = Math.floor(Date.now() / 1000); // Trenutno vreme u UNIX formatu (sekunde)
    if (decodedToken.exp < currentTimestamp) {
      // Token je istekao, treba ga osvežiti
      const user = {
        email: decodedToken.email,
      };
      logger.logUserAction(decodedToken.email, "refreshed token");
      const refreshedToken = jwt.sign(user, process.env.TOKEN_SECRET_KEY, {
        expiresIn: "7d",
      }); // Primer generisanja novog tokena sa novim payloadom i vremenom isteka od 1h
      return res.status(200).send(
        JSON.stringify({
          token: refreshedToken,
        })
      );
    }
    // Token je važeći, nema potrebe za osvežavanjem
    return res.status(200).send(
      JSON.stringify({
        token: token,
      })
    );
  } catch (error) {
    // Greška pri dekodiranju tokena ili druga greška
    console.error("Decoding JWT error:", error);
    return res
      .status(401)
      .send(JSON.stringify({ msg: "Decoding token error" }));
  }
}

async function isLoggedIn(req, res, next) {
  // Ova funkcija proverava da li postoji token i da li je token pravilan
  const token = req.headers["authorization"];
  //console.log('isLoogedIn token: ' + token)
  if (!token) {
    console.log("not logged in");
    return res.redirect("/auth.html");
  }
  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decode) => {
    //secretId
    if (err) {
      console.log("not logged in");
      return res.redirect("/auth.html");
    }
    req.email = decode.email;
    next();
  });
}
async function validateInput(req, res, next) {
  const loginMetod = req.headers["login-type"]; // moraju mala slova, opcije: google || standard
  console.log(loginMetod);
  if (loginMetod === "google") {
    return next();
  }
  console.log("Not google");
  const email = req.body.email;
  const password = req.body.password;
  const referral = req.body.referral;
  if (email && checkSqlInjection(email)) {
    console.error("QSL injection");
    return res.status(401).send(JSON.stringify({ msg: "QSL injection." }));
  }
  if (password && checkSqlInjection(password)) {
    console.error("QSL injection.");
    return res.status(401).send(JSON.stringify({ msg: "QSL injection." }));
  }
  if (referral && checkSqlInjection(referral)) {
    console.error("QSL injection.");
    return res.status(401).send(JSON.stringify({ msg: "QSL injection." }));
  }
  var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    console.log("Email empty.");
    return res.status(401).send(JSON.stringify({ msg: "Wrong credentials!" }));
  }
  if (!emailRegex.test(email)) {
    console.log("Email Wrong credentials.");
    return res.status(401).send(JSON.stringify({ msg: "Wrong credentials!" }));
  }
  if (!password) {
    console.log("Passwor empty.");
    return res.status(401).send(JSON.stringify({ msg: "Wrong credentials!" }));
  }
  if (password.length < 6) {
    console.log("Password short.");
    return res.status(401).send(JSON.stringify({ msg: "Wrong credentials!" }));
  }
  if (referral && referral.length > 8) {
    console.log("Referral to long.");
    return res.status(401).send(JSON.stringify({ msg: "Wrong credentials!" }));
  }
  next();
}

async function hasCredits(req, res, next) {
  const credits = await pool.query(queries.getUserCredits, [req.email]);
  if (credits.rows.length === 0 || credits.rows[0].quantity === 0) {
    return res
      .status(404)
      .send(JSON.stringify({ error: "User has no credits" }));
  }
  next();
}

function checkSqlInjection(value) {
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "UNION",
    "TRUNCATE",
  ];
  for (let i = 0; i < sqlKeywords.length; i++) {
    if (value.toUpperCase().includes(sqlKeywords[i])) {
      return true; // SQL injection detektovan
    }
  }

  return false; // Nema SQL injection
}

module.exports = {
  isLoggedIn,
  hasCredits,
  validateInput,
  refreshToken,
};
