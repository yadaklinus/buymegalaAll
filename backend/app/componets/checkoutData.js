const prisma = require("../../prisma/prisma")

const CheckoutData = async (req,res) =>{
    const {email} = req.body

    console.log(email)

    try {
        const user = await prisma.user.findUnique({where:{email}})
        
        if(!user) return res.status(400).json({mesage:"user not found"})

        const wallet = await prisma.wallet.findUnique({
            where:{userId:user.id}
        })

        return res.status(200).json({
            accountBalance:wallet.balance,
            bank:user.bankName,
            accountNumber:user.accountNumber,
            accountName:user.accountName
        })  
    } catch (error) {
        console.log("Error at checkoutData.js")
        return res.status(500).json({error:error})
    }
}

module.exports = CheckoutData