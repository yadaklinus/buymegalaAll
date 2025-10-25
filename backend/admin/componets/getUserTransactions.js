const prisma = require("../../prisma/prisma")

const GetUserTransactions = async (req, res) => {
    const { userId } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                supports: {
                    where: {
                        status: 'SUCCESS'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                withdraw: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                wallet: true
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Format supports as transactions
        const supportTransactions = user.supports.map(support => ({
            id: support.id,
            supporter: support.supporter || 'Anonymous',
            amount: support.amount / 100, // Convert to naira
            message: support.message,
            date: support.createdAt.toISOString().split('T')[0],
            status: 'approved', // These are successful payments
            type: 'support'
        }))

        // Format withdrawals
        const withdrawalTransactions = user.withdraw.map(withdrawal => ({
            id: withdrawal.id,
            amount: withdrawal.amount / 100,
            date: withdrawal.createdAt.toISOString().split('T')[0],
            status: withdrawal.status.toLowerCase(),
            type: 'withdrawal',
            description: withdrawal.description
        }))

        // Calculate user stats
        const totalReceived = user.supports.reduce((sum, support) => sum + support.amount, 0) / 100
        const totalWithdrawn = user.withdraw
            .filter(w => w.status === 'SUCCESS')
            .reduce((sum, w) => sum + w.amount, 0) / 100
        const currentBalance = user.wallet?.balance / 100 || 0

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.name?.charAt(0)?.toUpperCase() || 'U',
                balance: currentBalance,
                totalReceived,
                totalTransferred: totalWithdrawn,
                bankName: user.bankName,
                accountNumber: user.accountNumber,
                accountName: user.accountName
            },
            transactions: {
                supports: supportTransactions,
                withdrawals: withdrawalTransactions,
                all: [...supportTransactions, ...withdrawalTransactions].sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
            }
        })

    } catch (error) {
        console.error("Error getting user transactions:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = GetUserTransactions