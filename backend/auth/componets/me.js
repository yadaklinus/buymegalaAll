const prisma = require("../../prisma/prisma");

const Me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        goLive: user.goLive,
        galaPrice: user.galaPrice
      }
    });

  } catch (error) {
    console.error("Error At Me.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Me;
