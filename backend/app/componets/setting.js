const prisma = require("../../prisma/prisma")

const Setting = async (req,res) => {
   const email = req.user?.email;
   
   try {
    if(!email) return res.status(401).json({message:"Unauthorized access"})
       
    const user = await prisma.user.findUnique({
        where:{email}
    })
    if(!user) return res.status(400).json({message:"User Not Found"})
   

    

    return res.status(200).json({
        name:user.name,
        pageStatus:user.goLive,
        username:user.username,
        galaPrice:user.galaPrice,
        goalTitle: user.goalTitle,
        goalTarget: user.goalTarget,
        goalActive: user.goalActive,
        kycTier: user.kycTier || 1,
        bvn: user.bvn ? `***${user.bvn.slice(-4)}` : null,
        nin: user.nin ? `***${user.nin.slice(-4)}` : null,
        bvnVerified: user.bvnVerified,
        ninVerified: user.ninVerified,
    })

    
   } catch (error) {
    console.log("Error At Setting.js")
    res.status(500).json("error")
   }
}

module.exports = Setting