const prisma = require("../../prisma/prisma");
const { generateSecret, generateURI, verify } = require("otplib");
const qrcode = require("qrcode");

// Setup 2FA: Generate secret & QR code
const Setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const secret = generateSecret();
        const otpauth = generateURI({
            issuer: "BuyMeGala Admin",
            label: user.email,
            secret
        });
        const qrCodeUrl = await qrcode.toDataURL(otpauth);

        // Save secret temporarily until verified
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret }
        });

        res.status(200).json({
            secret,
            qrCodeUrl
        });
    } catch (error) {
        console.error("Error setting up 2FA:", error);
        res.status(500).json({ message: "Failed to setup 2FA" });
    }
};

// Verify 2FA code to activate
const Verify2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: "2FA code is required" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: "2FA setup not initialized" });
        }

        const isValidResult = await verify({
            token: code,
            secret: user.twoFactorSecret
        });

        const isValid = typeof isValidResult === 'boolean' ? isValidResult : isValidResult?.valid;

        if (!isValid) {
            return res.status(400).json({ message: "Invalid 2FA code" });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                adminId: userId,
                action: "ENABLE_2FA",
                details: "Admin enabled Google Authenticator 2FA",
                ipAddress: req.ip || req.headers['x-forwarded-for'] || null
            }
        }).catch(e => console.error("Audit log error:", e));

        res.status(200).json({ message: "2FA enabled successfully" });
    } catch (error) {
        console.error("Error verifying 2FA:", error);
        res.status(500).json({ message: "Failed to verify 2FA" });
    }
};

// Get 2FA Status
const Get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true }
        });

        res.status(200).json({ twoFactorEnabled: !!user?.twoFactorEnabled });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch 2FA status" });
    }
};

module.exports = { Setup2FA, Verify2FA, Get2FAStatus };
