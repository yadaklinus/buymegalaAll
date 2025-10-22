const prisma = require("../../prisma/prisma");

const Support = async (req, res) => {
  const { supporterName, message, amountValue, tx_ref, tx_id } = req.body;

  try {
    console.log(tx_ref);

    const userId = tx_ref.split("-")[1];
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ message: "user not found" });

    const sup = await prisma.support.create({
      data: {
        creatorId: user.id,
        amount: parseInt(amountValue, 10), // ensure Int
        supporter: supporterName,
        message,
        transactionId: tx_id,
      },
    });

    console.log(sup);
    return res.status(201).json({ message: "created", support: sup });
  } catch (error) {
    console.error("Error at Support.js:", error);
    return res.status(500).json({ error: error.message });
  }
 
};

module.exports = Support;
