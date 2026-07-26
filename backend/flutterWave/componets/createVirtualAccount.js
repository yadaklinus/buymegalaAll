const axios = require("axios");
const prisma = require("../../prisma/prisma");

const CreateVirtualAccount = async (req, res) => {
    try {
        const { creatorId, username, supporterName, amount, message } = req.body;

        const parsedAmount = parseInt(amount, 10);
        if (!creatorId || isNaN(parsedAmount) || parsedAmount < 100) {
            return res.status(400).json({ error: "Valid creator and minimum amount of ₦100 required" });
        }

        // Sanitize strings to prevent header/API injection
        const cleanUsername = String(username || 'creator').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
        const cleanSupporter = String(supporterName || 'Anonymous Supporter').trim().slice(0, 50);
        const cleanMessage = String(message || '').trim().slice(0, 500);

        const creator = await prisma.user.findUnique({ where: { id: creatorId } });
        if (!creator || !creator.emailVerified) {
            return res.status(403).json({ error: "This creator account has not verified their email address yet." });
        }

        const tx_ref = `BMG-VA-${creatorId}-${Date.now()}`;

        // Create pending support record in DB
        await prisma.support.create({
            data: {
                creatorId,
                supporter: cleanSupporter,
                amount: parsedAmount,
                message: cleanMessage,
                transactionId: tx_ref,
                status: "PENDING"
            }
        });

        // Call Flutterwave Virtual Account Numbers API
        const response = await axios.post(
            "https://api.flutterwave.com/v3/virtual-account-numbers",
            {
                email: "support@codegit.tech",
                is_permanent: false,
                tx_ref,
                amount: parsedAmount,
                currency: "NGN",
                account_name: `Buy Me Gala / @${cleanUsername}`,
                narrative: `Buy Me Gala Support for @${cleanUsername}`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.status === "success" && response.data.data) {
            const vaData = response.data.data;
            return res.status(200).json({
                status: "success",
                accountNumber: vaData.account_number,
                bankName: vaData.bank_name,
                accountName: vaData.account_name || `Buy Me Gala / @${username}`,
                amount: parseInt(amount),
                tx_ref,
                note: vaData.note || "Transfer exact amount to this bank account to complete support."
            });
        }

        return res.status(400).json({ error: response.data.message || "Failed to generate virtual account" });

    } catch (error) {
        console.error("Error creating Flutterwave Virtual Account:", error.response?.data || error.message);
        return res.status(500).json({ 
            error: error.response?.data?.message || "Failed to generate virtual account. Please use card payment." 
        });
    }
};

module.exports = CreateVirtualAccount;
