const prisma = require("../../prisma/prisma");

const Dashboard = async (req, res) => {
    const { email, supportersPage = 1, payoutsPage = 1 } = req.body;
    const limit = 5; // Items per page

    try {
        if (!email) return res.status(401).json({ message: "Email Required" });

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return res.status(400).json({ message: "User Not Found" });

        // Concurrently fetch counts and paginated data
        const [totalSupports, totalTransactions, totalEarningsResult, supports, transactions] = await Promise.all([
            prisma.support.count({ where: { creatorId: user.id,status:"SUCCESS" } }),
            prisma.transaction.count({ where: { userId: user.id } }),
            prisma.wallet.findUnique({
                where: { userId: user.id },
            }),
            prisma.support.findMany({
                where: { creatorId: user.id,status:"SUCCESS" },
                take: limit,
                skip: (supportersPage - 1) * limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.transaction.findMany({
                where: { userId: user.id,isWithdrawal:true },
                take: limit,
                skip: (payoutsPage - 1) * limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        console.log(totalEarningsResult)

        const totalEarnings = totalEarningsResult.balance

        return res.status(200).json({
            name: user.name,
            totalEarnings: totalEarnings,
            totalSupporters: totalSupports,
            pageStatus: user.goLive,
            username: user.username,
            supports: {
                data: supports,
                totalPages: Math.ceil(totalSupports / limit)
            },
            payouts: { // Renamed from 'traction' to match frontend
                data: transactions,
                totalPages: Math.ceil(totalTransactions / limit)
            }
        });

    } catch (error) {
        console.error("Error At Dashboard.js:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

module.exports = Dashboard;