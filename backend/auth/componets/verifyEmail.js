const prisma = require("../../prisma/prisma");
const { sendVerificationEmail } = require("../../services/emailService");

// Generate and send 6-digit verification OTP
const SendVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email address is required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

        if (!user) {
            return res.status(404).json({ error: "User account not found" });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }

        // Generate 6-digit random code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Delete existing verification tokens for this user email
        await prisma.verificationToken.deleteMany({
            where: { identifier: cleanEmail }
        }).catch(() => {});

        // Save new OTP code
        await prisma.verificationToken.create({
            data: {
                identifier: cleanEmail,
                token: otpCode,
                expires: expiresAt
            }
        });

        // Send Email via Resend
        await sendVerificationEmail(cleanEmail, otpCode);

        res.status(200).json({
            message: "Verification code sent to your email.",
            expiresInSeconds: 600
        });

    } catch (error) {
        console.error("Error sending verification OTP:", error);
        res.status(500).json({ error: "Failed to send verification email" });
    }
};

// Verify 6-digit OTP code
const VerifyOTP = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: "Email and 6-digit code are required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanCode = code.trim();

        const tokenRecord = await prisma.verificationToken.findFirst({
            where: {
                identifier: cleanEmail,
                token: cleanCode
            }
        });

        if (!tokenRecord) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (new Date() > new Date(tokenRecord.expires)) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
        }

        // Mark user emailVerified
        await prisma.user.update({
            where: { email: cleanEmail },
            data: { emailVerified: new Date() }
        });

        // Delete used token
        await prisma.verificationToken.delete({
            where: { token: tokenRecord.token }
        }).catch(() => {});

        res.status(200).json({
            message: "Email verified successfully!",
            emailVerified: true
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Failed to verify email code" });
    }
};

module.exports = { SendVerificationOTP, VerifyOTP };
