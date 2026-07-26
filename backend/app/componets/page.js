const prisma = require("../../prisma/prisma")

const Page = async (req,res) => {
    const { username } = req.body
    try {
        const user = await prisma.user.findUnique({where:{username}})

        if(!user){
            return res.status(404).json({message:"User Not Found"})
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: "This creator account has not verified their email address yet." });
        }

        // Calculate total successful supports amount for goal progress
        const totalEarningsResult = await prisma.support.aggregate({
            where: { creatorId: user.id, status: "SUCCESS" },
            _sum: { amount: true }
        });

        const totalRaised = totalEarningsResult._sum.amount || 0;

        return res.status(200).json({
            id:user.id,
            username:user?.username,
            galaPrice:user?.galaPrice,
            currency: user?.currency || "NGN",
            goLive:user?.goLive,
            profilePicture:user.image,
            displayName:user.name,
            bio:user.bio,
            goalTitle: user.goalTitle,
            goalTarget: user.goalTarget,
            goalActive: user.goalActive,
            totalRaised,
        })
    } catch (error) {
        console.log("Error at page.js",error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = Page