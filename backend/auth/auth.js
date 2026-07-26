const express = require("express");
const Register = require("./componets/register");
const Login = require("./componets/login");
const Logout = require("./componets/logout");
const Me = require("./componets/me");
const { SendVerificationOTP, VerifyOTP } = require("./componets/verifyEmail");
const authMiddleware = require("../authMiddleWare");

const route = express.Router();

route.post("/register", Register);
route.post("/login", Login);
route.post("/logout", Logout);
route.get("/me", authMiddleware, Me);
route.post("/send-otp", SendVerificationOTP);
route.post("/verify-otp", VerifyOTP);

module.exports = route;