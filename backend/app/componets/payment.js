const prisma = require("../../prisma/prisma");

const Payment = async (req,res) => {
    const {supporterName,
        message,
        amountValue,
        tx_ref} = req.body
    try {
        const userId = tx_ref.split("-")[1]
        const user = await prisma.user.findUnique({where:{
            id:userId
        }})
        if(!user) return res.status(404).json({message:"user not found"})

        await prisma.support.create({
            data:{
                creatorId:user.id,
                amount:amountValue,
                supporter:supporterName,
                message,
                transactionId:tx_ref
            }
        })

        await prisma.transaction.create({
            data:{
                userId:user.id,
                type:"CREDIT",
                amount:amountValue,
                reference:tx_ref,
            }
        })

        

        return res.status(201).json({message:"created"})
    } catch (error) {
        console.log("error at payment.js")
        return res.status(500).json({error:"error"})
    }
}

module.exports = Payment