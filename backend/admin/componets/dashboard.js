const prisma = require("../../prisma/prisma")

const Dashboard = async (req, res) => {
    try {
        // Get all users with their related data
        const users = await prisma.user.findMany({
            include: {
                wallet: true,
                supports: {
                    where: {
                        status: 'SUCCESS'
                    }
                },
                withdraw: {
                    where: {
                        status: 'PENDING'
                    }
                },
                transaction: true
            }
        })

        // Calculate stats for each user
        const usersWithStats = users.map(user => {
            const totalReceived = user.supports.reduce((sum, support) => sum + support.amount, 0)
            const totalWithdrawn = user.withdraw
                .filter(w => w.status === 'SUCCESS')
                .reduce((sum, w) => sum + w.amount, 0)
            const pendingWithdrawals = user.withdraw.filter(w => w.status === 'PENDING')
            const currentBalance = user.wallet?.balance || 0

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.name?.charAt(0)?.toUpperCase() || 'U',
                balance: currentBalance, // Convert from kobo to naira
                totalReceived: totalReceived,
                totalTransferred: totalWithdrawn,
                pendingCount: pendingWithdrawals.length,
                bankName: user.bankName,
                accountNumber: user.accountNumber,
                accountName: user.accountName
            }
        })

        // Get all pending supports (donations) for admin approval
        const pendingSupports = await prisma.support.findMany({
            where: {
                status: 'SUCCESS' // These are successful payments that need admin approval for payout
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Group supports by user
        const supportsByUser = {}
        pendingSupports.forEach(support => {
            const userId = support.creatorId
            if (!supportsByUser[userId]) {
                supportsByUser[userId] = []
            }
            supportsByUser[userId].push({
                id: support.id,
                supporter: support.supporter || 'Anonymous',
                amount: support.amount, // Convert to naira
                message: support.message,
                date: support.createdAt.toISOString().split('T')[0],
                status: 'pending' // For admin UI
            })
        })

        // Calculate global stats
        const totalBalance = usersWithStats.reduce((sum, u) => sum + u.balance, 0)
        const totalTransferred = usersWithStats.reduce((sum, u) => sum + u.totalTransferred, 0)
        const totalEverReceived = usersWithStats.reduce((sum, u) => sum + u.totalReceived, 0)
        const totalPendingTransactions = usersWithStats.reduce((sum, u) => sum + u.pendingCount, 0)

        res.status(200).json({
            users: usersWithStats,
            transactions: supportsByUser,
            globalStats: {
                totalBalance,
                totalTransferred,
                totalEverReceived,
                totalPendingTransactions
            }
        })

    } catch (error) {
        console.error("Error in admin dashboard:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = Dashboard