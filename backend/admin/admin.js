const express = require("express")
const Dashboard = require("./componets/dashboard")
const ApprovePayouts = require("./componets/approvePayouts")
const AuditLogs = require("./componets/auditLogs")
const { Setup2FA, Verify2FA, Get2FAStatus } = require("./componets/twoFactor")
const { ToggleFreezeUser, UpdateAdminNotes } = require("./componets/userGovernance")
const authAdminMiddleWare = require("../authAdminMiddleWare")

const route = express.Router()

route.get("/dashboard", authAdminMiddleWare, Dashboard)
route.post("/approve-payout", authAdminMiddleWare, ApprovePayouts)
route.get("/audit-logs", authAdminMiddleWare, AuditLogs)
route.get("/2fa/status", authAdminMiddleWare, Get2FAStatus)
route.post("/2fa/setup", authAdminMiddleWare, Setup2FA)
route.post("/2fa/verify", authAdminMiddleWare, Verify2FA)
route.post("/user/toggle-freeze", authAdminMiddleWare, ToggleFreezeUser)
route.post("/user/update-notes", authAdminMiddleWare, UpdateAdminNotes)

module.exports = route

