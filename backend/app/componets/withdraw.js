const prisma = require("../../prisma/prisma")
const bcrypt = require("bcrypt")

const Withdraw = async (req,res) => {
   
   const {email,pin} = req.body
   
   try {
    const user = await prisma.user.findUnique({
        where:{email}
    })

    if (!user) return res.status(404).json({ message: "user not found" });

    const wallet = await prisma.wallet.findUnique({
        where:{userId:user.id}
    })

    console.log(wallet)


    const compare = await bcrypt.compare(`${pin}`,user.pin)
    
   
    if(!compare) return res.status(400).json({ message: "Wrong Pin" });
   
    
    await prisma.transaction.create({
        data:{
            userId:user.id,
            isWithdrawal:true,
            amount:wallet.balance,
            type:"DEBIT",
        }
    })

    await prisma.withdraw.create({
        data:{
            userId:user.id,
            amount:wallet.balance,
        }
    })
    
    

    const wall = await prisma.wallet.update({
        where:{userId:user.id},
        data:{balance:{
            decrement:wallet.balance
        }}
    })

    console.log(wall)

    console.log("done")

    return res.status(200).json({
        compare
    })

    
   } catch (error) {
    console.log("Error At Withdraw.js")
    res.status(500).json("error")
   }
}

module.exports = Withdraw