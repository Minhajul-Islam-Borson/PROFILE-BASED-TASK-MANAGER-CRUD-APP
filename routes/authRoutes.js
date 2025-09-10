const express = require("express");
const { createUser, login, varifyEmail } = require("../controllers/authController");
const router = express.Router();

router.post("/register", createUser);
router.post("/login",login);
router.get("/verify/:token", varifyEmail);

module.exports = router;