const prisma = require("../../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "buymegalasecretkey";

const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const checkUser = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (checkUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "USER"
      }
    });

    // Initialize wallet
    await prisma.wallet.create({
      data: {
        userId: newUser.id,
        balance: 0
      }
    });

    // Send initial verification OTP via Resend
    try {
      const { sendVerificationEmail } = require("../../services/emailService");
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.verificationToken.create({
        data: {
          identifier: cleanEmail,
          token: otpCode,
          expires: expiresAt
        }
      });
      await sendVerificationEmail(cleanEmail, otpCode);
    } catch (e) {
      console.error("Non-fatal registration email sending error:", e);
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      status: "success",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Error At Register.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Register;