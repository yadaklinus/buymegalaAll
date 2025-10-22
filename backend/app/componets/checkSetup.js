const prisma = require("../../prisma/prisma");

const checkSetup = async (req, res) => {
  try {
    const { email } = req.params;


    if (!email) {
      return res.status(400).json({ message: "Email parameter is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User with that email not found." });
    }

    const isSetupComplete = !!(
      user.username &&
      user.bankName &&
      user.accountNumber &&
      user.accountName
    );


    return res.status(200).json({ isSetupComplete });

  } catch (error) {
    
    console.error("Error in checkSetup:", error);
    
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

module.exports = checkSetup;