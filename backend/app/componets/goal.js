const prisma = require("../../prisma/prisma");

const UpdateGoal = async (req, res) => {
  const email = req.user?.email;
  const { goalTitle, goalTarget, goalActive } = req.body;

  if (!email) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        goalTitle: goalTitle !== undefined ? String(goalTitle).trim() : user.goalTitle,
        goalTarget: goalTarget !== undefined ? Math.max(1, parseInt(goalTarget, 10) || 10) : user.goalTarget,
        goalActive: goalActive !== undefined ? Boolean(goalActive) : user.goalActive,
      },
    });

    return res.status(200).json({
      status: "success",
      goalTitle: updatedUser.goalTitle,
      goalTarget: updatedUser.goalTarget,
      goalActive: updatedUser.goalActive,
    });
  } catch (error) {
    console.error("Error at goal.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = UpdateGoal;
