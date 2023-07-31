const router = require("express").Router();
const auth = require("./auth");
const middleware = require("../middlewares/index");
const user = require("../controllers/user");
const generateVideo = require("../controllers/generate-video");
const webhook = require("./webhook");
const verification = require("../controllers/verification");

router.use(
  "/generate-video",
  middleware.isLoggedIn,
  middleware.hasCredits,
  generateVideo.getGenerateTemplate
);
router.use("/auth.html", auth);
router.use("/getEmail", middleware.isLoggedIn, user.getEmail);
router.use("/webhook", webhook);
router.use("/verify/:userToken", verification.verify);
router.use("/refreshToken", middleware.refreshToken);

// LOGIC
router.use(
  "/api/get-topic",
  middleware.isLoggedIn,
  middleware.hasCredits,
  require("./api/logicText").logicGenerateText
);
router.use(
  "/api/get-images",
  middleware.isLoggedIn,
  middleware.hasCredits,
  require("./api/logicImages")
);
router.use(
  "/api/get-video",
  middleware.isLoggedIn,
  middleware.hasCredits,
  require("./api/logicVideo")
);
router.use("/api/get-dir", middleware.isLoggedIn, require("./api/logicDir"));

module.exports = router;
