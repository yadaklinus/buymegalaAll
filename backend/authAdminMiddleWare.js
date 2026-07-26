const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

const prisma = require("./prisma/prisma");

function authAdminMiddleWare(req, res, next) {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "buymegalasecretkey";

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { role: true, email: true }
      });

      const adminEmails = ["linusyadak@gmail.com", "irenix.code@gmail.com"];
      const isAdmin = dbUser?.role === "ADMIN" || decoded.role === "ADMIN" || adminEmails.includes(dbUser?.email || "");

      if (!isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      next();
    } catch (dbErr) {
      console.error("Database error in admin middleware:", dbErr);
      return res.status(500).json({ error: "Server error verifying admin status" });
    }
  });
}

module.exports = authAdminMiddleWare;