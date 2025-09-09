const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const taskRouter = require("./routes/taskRoutes");
const authRouter = require("./routes/authRoutes")
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

module.exports = app;