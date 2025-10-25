// backend/flutterWave/componets/verifyPayment.js
const Flutterwave = require("flutterwave-node-v3");
const prisma = require("../../prisma/prisma");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const VerifyPayment = async (req, res) => {
  const { transaction_id, tx_ref } = req.body;

  try {
    if (!transaction_id) {
      return res.status(400).json({ error: "Transaction ID required" });
    }

    console.log(`🔍 Verifying payment: ${transaction_id}`);

    // Verify with Flutterwave
    const response = await flw.Transaction.verify({ id: transaction_id });

    if (!response || !response.data) {
      return res.status(400).json({ 
        status: "failed",
        message: "Verification failed" 
      });
    }

    const transaction = response.data;

    // Check if transaction is successful
    if (transaction.status === "successful" && transaction.tx_ref === tx_ref) {
      // Check if already processed in database
      const support = await prisma.support.findUnique({
        where: { transactionId: tx_ref },
      });

      if (support && support.status === "SUCCESS") {
        return res.status(200).json({
          status: "success",
          message: "Payment already verified",
          data: transaction,
        });
      }

      // If not yet processed, return pending (webhook will process it)
      return res.status(200).json({
        status: "pending",
        message: "Payment successful, processing...",
        data: transaction,
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "Payment verification failed",
        data: transaction,
      });
    }

  } catch (error) {
    console.error("❌ Verification error:", error);
    return res.status(500).json({ 
      status: "error",
      message: "Internal server error" 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = VerifyPayment;


// Add to backend/flutterWave/flutter.js
