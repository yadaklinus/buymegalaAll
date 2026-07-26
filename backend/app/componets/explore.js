const prisma = require("../../prisma/prisma");

const Explore = async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = q ? String(q).trim().toLowerCase() : "";

    // Build optimized search filter
    const whereCondition = {
      goLive: true,
      username: { not: null },
    };

    if (searchQuery) {
      whereCondition.OR = [
        { username: { contains: searchQuery } },
        { name: { contains: searchQuery } },
        { bio: { contains: searchQuery } },
      ];
    }

    // Query active creators with selected public fields only
    const creators = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        galaPrice: true,
        createdAt: true,
      },
      take: 24,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: "success",
      count: creators.length,
      creators,
    });
  } catch (error) {
    console.error("Error at Explore.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Explore;
