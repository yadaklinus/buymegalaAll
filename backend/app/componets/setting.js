const prisma = require("../../prisma/prisma")

const Setting = async (req,res) => {
   
   const {email} = req.body
   
   try {
    if(!email) return res.status(401).json({message:"Email Required"})
       

    const user = await prisma.user.findUnique({
        where:{email}
    })
    if(!user) return res.status(400).json({message:"User Not Found"})
   

    

    return res.status(200).json({
        name:user.name,
        pageStatus:user.goLive,
        username:user.username,
        galaPrice:user.galaPrice
    })

    
   } catch (error) {
    console.log("Error At Setting.js")
    res.status(500).json("error")
   }
}

module.exports = Setting