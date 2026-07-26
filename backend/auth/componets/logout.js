const Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax"
    });
    return res.status(200).json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    console.error("Error At Logout.js:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Logout;
