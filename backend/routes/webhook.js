const router = require("express").Router();
const webhook = require("../controllers/webhook");

router.post("/", webhook.payment);

module.exports = router;
