const prisma = require("../../prisma/prisma")

const ChangeGalaPrice = async (req,res)=>{
    const {email,newPrice} = req.body

    try {
        const user = await prisma.user.findUnique({where:{email}})
        if (!user ) return res.status(404).json({message:"user Not found"})

        if(newPrice < 500 || newPrice > 5000) return res.status(500).json({message:"user Not found"})

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