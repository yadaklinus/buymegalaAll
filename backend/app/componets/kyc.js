const SubmitKyc = async (req, res) => {
  return res.status(400).json({ 
    message: "KYC upgrade is currently disabled. All creator accounts operate on standard Tier 1 limits." 
  });
};

module.exports = SubmitKyc;
