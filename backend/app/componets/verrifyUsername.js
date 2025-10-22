const prisma = require("../../prisma/prisma");

const VerrifyUserName = async (req,res) => {
    const {username} = req.body
    try {
        if(!username && username.length < 3) return res.status(400).json("Username most be at least 3 char");

        const existingUser = await prisma.user.findUnique({where:{username}})

        console.log("ok")

        return res.status(200).json({
            available:!existingUser,
            message: existingUser ? "Username is already taken" : "Username is available"
        });
    } catch (error) {
        console.error("Error in verrifyUserName:", error);
    
        return res.status(500).json({ message: "An internal server error occurred." });
    }
}

module.exports = VerrifyUserName