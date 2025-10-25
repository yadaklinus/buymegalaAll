const express = require("express")
const Webhook = require("./componets/webhook")
const verrifyBankDetails = require("./componets/verrifyBankDetails")
const authMiddleware = require("../authMiddleWare")
const VerifyPayment = require("./componets/verifyPayment");

const route = express.Router()

route.post("/webhook",Webhook)
route.post("/verrifyAccount",authMiddleware,verrifyBankDetails)
route.post("/verify-payment", VerifyPayment);

module.exports = route