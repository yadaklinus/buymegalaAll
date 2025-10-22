const prisma = require("../../prisma/prisma");
const Flutterwave = require("flutterwave-node-v3");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const Webhook = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const secretHash = process.env.FLW_SECRET_HASH; // ✅ Use FLW secret hash
  const signature = req.headers["verif-hash"];

  if (!signature || signature !== secretHash) {
    return res.status(401).end("Invalid signature");
  }

  const event = req.body;

  console.log("📬 Incoming Flutterwave webhook:", event);

  if (event.status === "successful") {
    try {
      // ✅ Step 1: Verify transaction with Flutterwave API
      const verifyResp = await flw.Transaction.verify({ id: event.id });

      const tx = verifyResp.data;

      console.log(verifyResp)
     
      if (
        tx.status === "successful" ||
        tx.tx_ref === event.tx_ref ||
        tx.amount === event.amount
      ) {
        const tx_ref = tx.tx_ref;
        const userId = tx_ref.split("-")[1];

        // ✅ Step 2: Idempotency check
        const existingTx = await prisma.transaction.findUnique({
          where: { reference: tx_ref },
        });

        if (existingTx && existingTx.status === "SUCCESS") {
          console.log("⚠️ Duplicate webhook for tx_ref:", tx_ref);
          return res.status(200).json({ status: "duplicate" });
        }

        // ✅ Step 3: Wrap updates in a DB transaction
        await prisma.$transaction([
          prisma.support.update({
            where: { transactionId: tx_ref },
            data: { status: "SUCCESS", amount: tx.amount },
          }),
          prisma.transaction.update({
            where: { reference: tx_ref },
            data: { status: "SUCCESS", amount: tx.amount },
          }),
          prisma.wallet.update({
            where: { userId },
            data: { balance: { increment: tx.amount } },
          }),
        ]);

        console.log("✅ Payment confirmed & wallet updated:", tx_ref);
      } else {
        console.warn("❌ Transaction verification mismatch:", tx);
      }
    } catch (err) {
      console.error("Error verifying/updating transaction:", err);
    }
  }

  res.status(200).json({ status: "ok" });
};

module.exports = Webhook;
