const prisma = require("../../prisma/prisma");

// Real-time status polling for virtual account transfer completion
const CheckVaStatus = async (req, res) => {
    try {
        const { tx_ref } = req.query;

        if (!tx_ref || typeof tx_ref !== "string" || !tx_ref.startsWith("BMG-VA-")) {
            return res.status(400).json({ error: "Valid transaction reference required" });
        }

        const cleanTxRef = tx_ref.trim().slice(0, 100);

        const support = await prisma.support.findUnique({
            where: { transactionId: cleanTxRef }
        });

        if (!support) {
            return res.status(404).json({ error: "Transaction reference not found" });
        }

        return res.status(200).json({
            status: support.status, // "PENDING" | "SUCCESS" | "FAILED"
            isPaid: support.status === "SUCCESS",
            supporterName: support.supporter,
            amount: support.amount
        });

    } catch (error) {
        console.error("Error checking VA status:", error);
        return res.status(500).json({ error: "Failed to check status" });
    }
};

module.exports = CheckVaStatus;
