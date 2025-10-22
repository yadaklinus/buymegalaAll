const express = require("express")
const Webhook = require("./componets/webhook")
const verrifyBankDetails = require("./componets/verrifyBankDetails")
const authMiddleware = require("../authMiddleWare")

const route = express.Router()

route.post("/webhook",Webhook)
route.post("/verrifyAccount",authMiddleware,verrifyBankDetails)

module.exports = route