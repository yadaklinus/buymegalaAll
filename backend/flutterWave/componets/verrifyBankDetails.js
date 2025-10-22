const { default: axios } = require("axios");

const verrifyBankDetails = async (req,res)=>{
    const { account_number, bank_code } = req.body;

  if (!account_number || !bank_code) {
    return res.status(400).json({ error: "Account number and bank code are required" });
  }

  console.log(account_number, bank_code)

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/accounts/resolve",
      {
        account_number,
        account_bank: bank_code,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Flutterwave error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to verify account",
      details: error.response?.data || error.message,
    });
  }
}

module.exports = verrifyBankDetails