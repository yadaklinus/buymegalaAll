const prisma = require("../../prisma/prisma")


const Register = async (req,res)=>{
    try {
        const {user} = await req.body
    
        const checkUser = await prisma.user.findUnique({where:{email:user.email}})

    if(checkUser){
        return res.json({message:"Elail exists"})
    }

    await prisma.user.create({
        data:{
            name:user.name,
            email:user.email,
            image:user.image
        }
    }).then( async (newUser)=>{
        await prisma.account.create({
            data:{
                userId:newUser.id,
                provider:"GOOGLE",
                providerAccountId:user.id,
                type:"USER"
            }
        })

        await prisma.wallet.create({
            data:{
                userId:newUser.id
            }
        })
    })

    console.log("done")

    return res.status(201).json("done")
    } catch (error) {
        console.log("Error At Register.js",error)
        res.status(500).json("error")
    }
}

module.exports = Register