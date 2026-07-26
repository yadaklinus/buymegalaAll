const prisma = require("../../prisma/prisma");

const Support = async (req, res) => {
  const { supporterName, message, amountValue, tx_ref, tx_id } = req.body;

  try {
    // Validate input
    if (!tx_ref || !amountValue) {
      return res.status(400).json({ 
        error: "Missing required fields: tx_ref and amountValue" 
      });
    }

    console.log("📝 Creating support record:", { tx_ref, amountValue });

    // Extract userId from tx_ref
    const userId = tx_ref.split("-")[1];
    if (!userId) {
      return res.status(400).json({ error: "Invalid transaction reference" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: "This creator account has not verified their email address yet and cannot receive payments." });
    }

    if (user.isFrozen) {
      return res.status(403).json({ error: "This creator account is currently frozen and cannot receive support." });
    }

    // Check if support record already exists
    const existingSupport = await prisma.support.findUnique({
      where: { transactionId: tx_ref },
    });

    if (existingSupport) {
      console.log("⚠️ Support record already exists:", tx_ref);
      return res.status(200).json({ 
        message: "Support record exists", 
        support: existingSupport 
      });
    }

    const numAmount = parseInt(amountValue, 10) || 0;

    // Create support record with PENDING status
    const sup = await prisma.support.create({
      data: {
        creatorId: user.id,
        amount: numAmount,
        supporter: supporterName || "Anonymous",
        message: message || "",
        transactionId: tx_ref, // Use tx_ref as the unique identifier
        status: "PENDING", // Will be updated by webhook
      },
    });

    // Create transaction record with PENDING status
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "CREDIT",
        amount: numAmount,
        reference: tx_ref,
        status: "PENDING", // Will be updated by webhook
        description: `Support from ${supporterName || "Anonymous"}`,
      },
    });

    console.log("✅ Support record created:", sup.id);
    return res.status(201).json({ 
      message: "Support record created", 
      support: sup 
    });

  } catch (error) {
    console.error("❌ Error in Support.js:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = Support;