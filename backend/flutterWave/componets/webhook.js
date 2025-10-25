const prisma = require("../../prisma/prisma");
const Flutterwave = require("flutterwave-node-v3");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const Webhook = async (req, res) => {
  try {
    // Verify webhook signature
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      console.log("❌ Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log("📬 Incoming webhook:", JSON.stringify(event, null, 2));

    // Only process successful payments
    if (event.status !== "successful") {
      console.log(`⚠️ Payment not successful. Status: ${event.status}`);
      return res.status(200).json({ status: "ignored" });
    }

    // Verify the transaction with Flutterwave API
    const transactionId = event.id;
    if (!transactionId) {
      console.log("❌ No transaction ID in webhook");
      return res.status(400).json({ error: "No transaction ID" });
    }

    console.log(`🔍 Verifying transaction: ${transactionId}`);
    const verifyResp = await flw.Transaction.verify({ id: transactionId });

    if (!verifyResp || !verifyResp.data) {
      console.log("❌ Failed to verify transaction");
      return res.status(400).json({ error: "Verification failed" });
    }

    const tx = verifyResp.data;
    console.log("✅ Verified transaction:", JSON.stringify(tx, null, 2));

    // Validate transaction details
    if (
      tx.status !== "successful" ||
      tx.currency !== "NGN" ||
      !tx.tx_ref
    ) {
      console.log("❌ Transaction validation failed");
      return res.status(400).json({ error: "Invalid transaction" });
    }

    const tx_ref = tx.tx_ref;
    const amount = tx.amount;

    // Extract user ID from reference
    const userId = tx_ref.split("-")[1];
    if (!userId) {
      console.log("❌ Invalid tx_ref format");
      return res.status(400).json({ error: "Invalid reference" });
    }

    // Check if transaction already processed (idempotency)
    const existingSupport = await prisma.support.findUnique({
      where: { transactionId: tx_ref },
    });

    if (existingSupport && existingSupport.status === "SUCCESS") {
      console.log(`⚠️ Duplicate webhook for tx_ref: ${tx_ref}`);
      return res.status(200).json({ status: "duplicate" });
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference: tx_ref },
    });

    if (existingTransaction && existingTransaction.status === "SUCCESS") {
      console.log(`⚠️ Transaction already processed: ${tx_ref}`);
      return res.status(200).json({ status: "duplicate" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`💰 Processing payment for user: ${user.email}`);

    // Process transaction in a database transaction
    await prisma.$transaction(async (prisma) => {
      // Update or create support record
      if (existingSupport) {
        await prisma.support.update({
          where: { transactionId: tx_ref },
          data: {
            status: "SUCCESS",
            amount: Math.round(amount), // Convert to kobo
          },
        });
      }

      // Update or create transaction record
      if (existingTransaction) {
        await prisma.transaction.update({
          where: { reference: tx_ref },
          data: {
            status: "SUCCESS",
            amount: Math.round(amount),
          },
        });
      }

      // Update wallet balance
      await prisma.wallet.upsert({
        where: { userId },
        update: {
          balance: {
            increment: Math.round(amount),
          },
        },
        create: {
          userId,
          balance: Math.round(amount),
        },
      });

      console.log(`✅ Wallet updated for ${user.email}: +₦${amount}`);
    });

    console.log(`✅ Payment processed successfully: ${tx_ref}`);
    return res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = Webhook;