const prisma = require("../../prisma/prisma");

// Toggle account freeze / unfreeze status
const ToggleFreezeUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const adminId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const newFreezeStatus = !targetUser.isFrozen;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isFrozen: newFreezeStatus }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: newFreezeStatus ? "FREEZE_USER" : "UNFREEZE_USER",
                targetId: userId,
                details: JSON.stringify({ email: targetUser.email, isFrozen: newFreezeStatus }),
                ipAddress: req.ip || req.headers['x-forwarded-for'] || null
            }
        }).catch(e => console.error("Audit log error:", e));

        res.status(200).json({
            message: `User account ${newFreezeStatus ? 'frozen' : 'unfrozen'} successfully`,
            isFrozen: newFreezeStatus
        });
    } catch (error) {
        console.error("Error toggling user freeze:", error);
        res.status(500).json({ message: "Failed to update user status" });
    }
};

// Update private admin notes for a user
const UpdateAdminNotes = async (req, res) => {
    try {
        const { userId, notes } = req.body;
        const adminId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { adminNotes: notes }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: "UPDATE_ADMIN_NOTES",
                targetId: userId,
                details: JSON.stringify({ notesLength: notes?.length || 0 }),
                ipAddress: req.ip || req.headers['x-forwarded-for'] || null
            }
        }).catch(e => console.error("Audit log error:", e));

        res.status(200).json({ message: "Admin notes updated successfully" });
    } catch (error) {
        console.error("Error updating admin notes:", error);
        res.status(500).json({ message: "Failed to update admin notes" });
    }
};

module.exports = { ToggleFreezeUser, UpdateAdminNotes };
