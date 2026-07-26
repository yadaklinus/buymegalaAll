const prisma = require("../../prisma/prisma")
const { verify } = require("otplib")

const ApprovePayouts = async (req, res) => {
    const { userId, totpCode } = req.body

    try {
        const adminId = req.user.id;
        const adminUser = await prisma.user.findUnique({ where: { id: adminId } });

        // If 2FA is enabled for admin, verify TOTP token
        if (adminUser?.twoFactorEnabled) {
            if (!totpCode) {
                return res.status(400).json({ message: "2FA authentication code required" });
            }
            const isValidResult = await verify({
                token: totpCode,
                secret: adminUser.twoFactorSecret || ""
            });
            const isValidTotp = typeof isValidResult === 'boolean' ? isValidResult : isValidResult?.valid;
            if (!isValidTotp) {
                return res.status(400).json({ message: "Invalid 2FA authentication code" });
            }
        }

        // Get user and their wallet
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                supports: {
                    where: {
                        status: 'SUCCESS'
                    }
                }
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (!user.wallet || user.wallet.balance <= 0) {
            return res.status(400).json({ message: "No balance to withdraw" })
        }

        // Check if user has bank details
        if (!user.bankName || !user.accountNumber || !user.accountName) {
            return res.status(400).json({ message: "User has incomplete bank details" })
        }

        const withdrawAmount = user.wallet.balance

        // Create withdrawal record
        const withdrawal = await prisma.withdraw.create({
            data: {
                userId: user.id,
                amount: withdrawAmount,
                status: 'SUCCESS', // Mark as successful since admin approved
                description: `Admin approved payout - ${new Date().toISOString()}`
            }
        })

        // Create transaction record
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'DEBIT',
                amount: withdrawAmount,
                status: 'SUCCESS',
                isWithdrawal: true,
                description: `Payout approved by admin - Ref: ${withdrawal.id}`
            }
        })

        // Update wallet balance to 0
        await prisma.wallet.update({
            where: { userId: user.id },
            data: { balance: 0 }
        })

        // Log admin action in AuditLog
        if (req.user && req.user.id) {
            await prisma.auditLog.create({
                data: {
                    adminId: req.user.id,
                    action: "APPROVE_PAYOUT",
                    targetId: user.id,
                    details: JSON.stringify({ amount: withdrawAmount, accountNumber: user.accountNumber, bankName: user.bankName }),
                    ipAddress: req.ip || req.headers['x-forwarded-for'] || null
                }
            }).catch(e => console.error("Audit log creation error:", e));
        }

        res.status(200).json({
            message: "Payout approved successfully",
            withdrawal: {
                id: withdrawal.id,
                amount: withdrawAmount / 100, // Convert to naira
                bankName: user.bankName,
                accountNumber: user.accountNumber,
                accountName: user.accountName
            }
        })

    } catch (error) {
        console.error("Error approving payout:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = ApprovePayouts