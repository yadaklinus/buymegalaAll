const prisma = require("../../prisma/prisma")
const bcrypt = require("bcrypt")

const Setup = async (req,res) => {
    const {email,username,bankDetails,displayName,galaPrice,bio,pin} = req.body
    try {
        const existingUser = await prisma.user.findUnique({where:{email}})

        if(!existingUser || (galaPrice < 500 && galaPrice > 5000)) return res.status(404).json("User Not Found")

        const usernameExist = await prisma.user.findUnique({where:{username:username}})

        if(usernameExist && usernameExist.id == existingUser.id) return res.status(400).json("Username Exists")

        const hash = await bcrypt.hash(`${pin}`,10)

        const updateUser = await prisma.user.update({
            where:{email},
            data:{
                name:displayName,
                username,
                bankName:bankDetails.bankName,
                accountName:bankDetails.accountName,
                accountNumber:bankDetails.accountNumber,
                galaPrice,
                goLive:true,
                bio,
                pin:hash
            }
        })

        return res.status(200).json({
            mesage:"Done",
            user:{
                id:updateUser.id,
                username:updateUser.username,
                email:updateUser.email,
                setupCompleted:true
            }
        })
    } catch (error) {
        console.log("Error At Setup.js")

        return res.status(500).json(error)
    }
}

module.exports = Setup