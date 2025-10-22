const prisma = require("../../prisma/prisma");

const Nav = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) return res.status(401).json({ message: "Email Required" });

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return res.status(400).json({ message: "User Not Found" });

        return res.status(200).json({
            username: user.username,
        });

    } catch (error) {
        console.error("Error At Nav.js:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

module.exports = Nav;