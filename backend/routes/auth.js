const router = require("express").Router();
const login = require("../controllers/login");
const middleware = require("../middlewares/index");

router.post("/", middleware.validateInput, login);

module.exports = router;
