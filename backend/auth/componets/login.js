const prisma = require("../../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "buymegalasecretkey";

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Please sign up with a password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error("Error At Login.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Login;
