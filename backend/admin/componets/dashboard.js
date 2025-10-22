const prisma = require("../../prisma/prisma")

const Dashboard = async (req,res) => {
    const users = await prisma.user.findMany({
        include:{
            transaction:true,
            
        }
    })
}

module.exports = Dashboard