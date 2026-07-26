try { require("dotenv").config(); } catch (e) {}
const express = require("express")
const cors = require('cors')
const app = express()
const PORT = 4000
const Auth = require("./auth/auth")
const User = require("./app/app")
const Flutter = require("./flutterWave/flutter")
const admin = require("./admin/admin")

app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
}))

app.use((req, res, next) => {
    const list = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(";").forEach((cookie) => {
            let [name, ...rest] = cookie.split("=");
            name = name?.trim();
            if (name) {
                list[name] = decodeURIComponent(rest.join("=").trim());
            }
        });
    }
    req.cookies = list || {};
    next();
});

const rateLimit = require("express-rate-limit");

// General API Rate Limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

// Strict Auth Rate Limiter: 15 requests per 15 minutes per IP (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login/register attempts. Please try again after 15 minutes." }
});

// Anti-Bot Resend Quota Limiter: 3 OTP requests per 15 minutes per IP
const emailOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification email requests. Please wait 15 minutes before requesting another code." }
});

// Strict Admin Rate Limiter: 40 requests per 15 minutes per IP
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many administrative requests. Please slow down." }
});

app.use(express.json());
app.use(apiLimiter);

app.use("/auth/send-otp", emailOtpLimiter);
app.use("/auth", authLimiter, Auth);
app.use("/user", User);
app.use("/flutter", Flutter);
app.use("/admin", adminLimiter, admin);

app.listen(PORT,()=>{
    console.log(`Running on port ${PORT}`)
})