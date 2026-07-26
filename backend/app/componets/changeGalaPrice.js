const prisma = require("../../prisma/prisma");
const { getTierLimits } = require("../../config/tierLimits");

const ChangeGalaPrice = async (req,res)=>{
    const email = req.user?.email;
    const { newPrice } = req.body;

    try {
        if (!email) return res.status(401).json({ message: "Unauthorized access" });
        const user = await prisma.user.findUnique({where:{email}})
        if (!user ) return res.status(404).json({message:"User not found"})

        const tierLimits = getTierLimits(user.kycTier);
        const parsedPrice = parseInt(newPrice, 10);

        if (isNaN(parsedPrice) || parsedPrice < 500) {
            return res.status(400).json({ message: "Minimum Gala price is ₦500" });
        }

        if (parsedPrice > tierLimits.maxGalaPrice) {
            return res.status(400).json({
                message: `Price exceeds ${tierLimits.name} maximum price of ₦${tierLimits.maxGalaPrice.toLocaleString()} per Gala. Upgrade your account Tier in Settings to increase your price limit!`,
            });
        }

            console.log(newPrice)
        await prisma.user.update({
            where:{
                email
            },
            data:{
                galaPrice:parseInt(newPrice)
            }
        })
        return res.status(200).json({message:"Changed Done"})
        
    } catch (error) {
        console.log("Error At changeGalaPrice.js")
        return res.status(500).json({message:"Eror",error})
    }finally{
        prisma.$disconnect()
    }
}

module.exports = ChangeGalaPrice