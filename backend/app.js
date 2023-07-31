const express = require("express");
const path = require("path");
const middleware = require("./middlewares/index");
const userRoutes = require("./db/routes");
const { config } = require("dotenv");
config();

const app = express();

// body parser middleware
app.use(express.json()); // ovo da u bodiju imamo json
app.use(express.urlencoded({ extended: false })); // ovo je za forme
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/assets", express.static(path.join(__dirname, "./assets")));

// INDEX for all routes
app.use("/", require("./routes/index"));

// server config
app.listen(3000, () => console.log("server started at port 3000"));
