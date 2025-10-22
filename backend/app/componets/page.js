const prisma = require("../../prisma/prisma")

const Page = async (req,res) => {
    const { username } = req.body
    try {
        const user = await prisma.user.findUnique({where:{username}})

        if(!user){
            return res.status(404).json({message:"USer Not Found"})
        }

        return res.status(200).json({
            id:user.id,
            username:user?.username,
            galaPrice:user?.galaPrice,
            goLive:user?.goLive,
            profilePicture:user.image,
            displayName:user.name,
            bio:user.bio
        })
    } catch (error) {
        console.log("Error at page.js",error)
        return res.json(error,{status:500})
    }
}

module.exports = Page