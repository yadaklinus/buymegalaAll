const prisma = require("../../prisma/prisma");

const GetAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            take: 50,
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ logs });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};

module.exports = GetAuditLogs;
