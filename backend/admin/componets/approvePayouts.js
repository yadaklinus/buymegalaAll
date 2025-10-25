const prisma = require("../../prisma/prisma")

const ApprovePayouts = async (req, res) => {
    const { userId } = req.body

    try {
        // Get user and their wallet
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                supports: {
                    where: {
                        status: 'SUCCESS'
                    }
                }
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (!user.wallet || user.wallet.balance <= 0) {
            return res.status(400).json({ message: "No balance to withdraw" })
        }

        // Check if user has bank details
        if (!user.bankName || !user.accountNumber || !user.accountName) {
            return res.status(400).json({ message: "User has incomplete bank details" })
        }

        const withdrawAmount = user.wallet.balance

        // Create withdrawal record
        const withdrawal = await prisma.withdraw.create({
            data: {
                userId: user.id,
                amount: withdrawAmount,
                status: 'SUCCESS', // Mark as successful since admin approved
                description: `Admin approved payout - ${new Date().toISOString()}`
            }
        })

        // Create transaction record
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'DEBIT',
                amount: withdrawAmount,
                status: 'SUCCESS',
                isWithdrawal: true,
                description: `Payout approved by admin - Ref: ${withdrawal.id}`
            }
        })

        // Update wallet balance to 0
        await prisma.wallet.update({
            where: { userId: user.id },
            data: { balance: 0 }
        })

        res.status(200).json({
            message: "Payout approved successfully",
            withdrawal: {
                id: withdrawal.id,
                amount: withdrawAmount / 100, // Convert to naira
                bankName: user.bankName,
                accountNumber: user.accountNumber,
                accountName: user.accountName
            }
        })

    } catch (error) {
        console.error("Error approving payout:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = ApprovePayouts