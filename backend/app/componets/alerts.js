const prisma = require("../../prisma/prisma");

// Simple in-memory store for instant test alerts
const activeTestAlerts = new Map();

const AlertsFeed = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username parameter is required" });

    const user = await prisma.user.findUnique({
      where: { username: String(username).toLowerCase().trim() },
    });

    if (!user) return res.status(404).json({ error: "Creator not found" });

    // Check if a test alert is queued
    if (activeTestAlerts.has(user.id)) {
      const testAlert = activeTestAlerts.get(user.id);
      activeTestAlerts.delete(user.id); // Consumption once
      return res.status(200).json({ alert: testAlert });
    }

    // Fetch latest successful support record from last 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const latestSupport = await prisma.support.findFirst({
      where: {
        creatorId: user.id,
        status: "SUCCESS",
        createdAt: { gte: sixtySecondsAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (latestSupport) {
      const galasCount = Math.max(1, Math.round((latestSupport.amount || 0) / (user.galaPrice || 500)));
      return res.status(200).json({
        alert: {
          id: latestSupport.id,
          supporter: latestSupport.supporter || "Anonymous",
          message: latestSupport.message || "Just bought you a Gala!",
          amount: latestSupport.amount,
          galas: galasCount,
          isTest: false,
        },
      });
    }

    return res.status(200).json({ alert: null });
  } catch (error) {
    console.error("Error at alertsFeed.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const TriggerTestAlert = async (req, res) => {
  const userEmail = req.user?.email;
  if (!userEmail) return res.status(401).json({ error: "Unauthorized access" });

  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const testAlert = {
      id: "test-" + Date.now(),
      supporter: "Test Supporter 🚀",
      message: "Testing the Buy Me Gala OBS Live Stream Alert!",
      amount: (user.galaPrice || 500) * 5,
      galas: 5,
      isTest: true,
    };

    activeTestAlerts.set(user.id, testAlert);

    return res.status(200).json({ status: "success", alert: testAlert });
  } catch (error) {
    console.error("Error at triggerTestAlert:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { AlertsFeed, TriggerTestAlert };
