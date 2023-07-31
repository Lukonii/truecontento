const pool = require("../db/db");
const crypto = require("crypto");
const Serialize = require("php-serialize");
const queries = require("../db/queries");
const logger = require("../logger");
require("dotenv").config();

async function payment(req, res) {
  if (!req.body) return res.status(401).json({ error: "No req body found." });

  if (req.body.alert_name === "payment_succeeded") {
    if (!validateWebhook(req.body)) {
      console.log("wrong signature");
      return res.status(403).json({ error: "No valid signature" });
    }
    const user = await pool.query(queries.getUserByEmail, [req.body.email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "No user found." });
    }
    const product = await pool.query(queries.getProductByName, [
      req.body.product_name,
    ]);
    if (product.rows.length === 0) {
      return res.status(401).json({ error: "No product found." });
    }
    const amount = req.body.quantity * product.rows[0].quantity;
    await pool.query(queries.updateCreditsForEmail, [
      user.rows[0].email,
      amount,
    ]);
    await pool.query(queries.addTransaction, [
      user.rows[0].email,
      product.rows[0].name,
      req.body.event_time,
    ]);
    if (req.body.coupon !== "") {
      await pool.query(queries.addUsedDiscount, [
        user.rows[0].email,
        req.body.coupon,
      ]);
    }
    logger.logUserAction(user.rows[0].email, "Payment succeeded.");
    console.log("Payment succeeded!");
    return res.status(200).json({ success: true });
  }
}
function ksort(obj) {
  const keys = Object.keys(obj).sort();
  let sortedObj = {};
  for (let i in keys) {
    sortedObj[keys[i]] = obj[keys[i]];
  }
  return sortedObj;
}

function validateWebhook(jsonObj) {
  // Grab p_signature
  const mySig = Buffer.from(jsonObj.p_signature, "base64");
  // Remove p_signature from object - not included in array of fields used in verification.
  delete jsonObj.p_signature;
  // Need to sort array by key in ascending order
  jsonObj = ksort(jsonObj);
  for (let property in jsonObj) {
    if (
      jsonObj.hasOwnProperty(property) &&
      typeof jsonObj[property] !== "string"
    ) {
      if (Array.isArray(jsonObj[property])) {
        // is it an array
        jsonObj[property] = jsonObj[property].toString();
      } else {
        //if its not an array and not a string, then it is a JSON obj
        jsonObj[property] = JSON.stringify(jsonObj[property]);
      }
    }
  }
  // Serialise remaining fields of jsonObj
  const serialized = Serialize.serialize(jsonObj);
  // verify the serialized array against the signature using SHA1 with your public key.
  const verifier = crypto.createVerify("sha1");
  verifier.update(serialized);
  verifier.end();

  const verification = verifier.verify(process.env.PADDLE_PUBLIC_KEY, mySig);
  // Used in response if statement
  return verification;
}

module.exports = { payment };
