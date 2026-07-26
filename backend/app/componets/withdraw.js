const prisma = require("../../prisma/prisma");
const bcrypt = require("bcrypt");
const { getTierLimits } = require("../../config/tierLimits");

const Withdraw = async (req, res) => {
  const userEmail = req.user?.email;
  const { pin } = req.body;

  if (!userEmail) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  if (!pin) {
    return res.status(400).json({ message: "Transaction PIN is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.pin) {
      return res.status(400).json({ message: "Please set up your transaction PIN first" });
    }

    const compare = await bcrypt.compare(`${pin}`, user.pin);
    if (!compare) return res.status(400).json({ message: "Invalid transaction PIN" });

    // Check AML Tier limits
    const tierLimits = getTierLimits(user.kycTier);
    
    // Calculate total withdrawals in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyWithdrawalsResult = await prisma.withdraw.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: twentyFourHoursAgo },
        status: { in: ["PENDING", "SUCCESS"] },
      },
      _sum: { amount: true },
    });

    const totalDailyWithdrawals = dailyWithdrawalsResult._sum.amount || 0;

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    if (!wallet || wallet.balance <= 0) {
      return res.status(400).json({ message: "Insufficient balance for withdrawal" });
    }

    const potentialDailyTotal = totalDailyWithdrawals + wallet.balance;
    if (potentialDailyTotal > tierLimits.dailyWithdrawalLimit) {
      return res.status(400).json({
        message: `Withdrawal limit exceeded! ${tierLimits.name} daily limit is ₦${tierLimits.dailyWithdrawalLimit.toLocaleString()}. Upgrade your account Tier in Settings to increase your limits.`,
      });
    }

    // Perform atomic transaction to prevent double spending
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: user.id }
      });

      if (!wallet || wallet.balance <= 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const withdrawAmount = wallet.balance;

      await tx.transaction.create({
        data: {
          userId: user.id,
          isWithdrawal: true,
          amount: withdrawAmount,
          type: "DEBIT",
          status: "PENDING"
        }
      });

      await tx.withdraw.create({
        data: {
          userId: user.id,
          amount: withdrawAmount,
          status: "PENDING"
        }
      });

      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: 0 }
      });

      return withdrawAmount;
    });

    return res.status(200).json({ status: "success", amount: result });

  } catch (error) {
    if (error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({ message: "Insufficient balance for withdrawal" });
    }
    console.error("Error at Withdraw.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Withdraw