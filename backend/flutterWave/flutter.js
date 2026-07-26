const express = require("express")
const Webhook = require("./componets/webhook")
const verrifyBankDetails = require("./componets/verrifyBankDetails")
const authMiddleware = require("../authMiddleWare")
const VerifyPayment = require("./componets/verifyPayment");
const CreateVirtualAccount = require("./componets/createVirtualAccount");
const CheckVaStatus = require("./componets/checkVaStatus");

const route = express.Router()

route.post("/webhook",Webhook)
route.post("/verrifyAccount",authMiddleware,verrifyBankDetails)
route.post("/verify-payment", VerifyPayment);
route.post("/create-virtual-account", CreateVirtualAccount);
route.get("/va-status", CheckVaStatus);

module.exports = route