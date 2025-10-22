const jwt =require("jsonwebtoken");

function authAdminMiddleWare(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]; // remove "Bearer"
  jwt.verify(token, process.env.NEXTAUTH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded; // user info (id/email)
    if(decoded.email !== "linusyadak@gmail.com" || decoded.email !== "irenix.code@gmail.com") return res.status(403).json({ error: "Invalid token" });
    next();
  });
}

module.exports = authAdminMiddleWare