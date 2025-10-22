const prisma = require("../../prisma/prisma")

const Activate = async (req,res)=>{
    const {email,active} = req.body
    try {
        const user = await prisma.user.findUnique({where:{email}})
        if (!user) return res.status(400).json({message:"User Not found"})

        const ch  = await prisma.user.update({
            where:{
                email
            },
            data:{
                goLive: Boolean(active)
            }
        })
        return res.status(200).json(ch)
        
    } catch (error) {
        console.log("Error at activate.js")
        return res.status(500).json(error)
    }finally{
        prisma.$disconnect()
    }
}

module.exports = Activate