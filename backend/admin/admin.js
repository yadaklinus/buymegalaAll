const express = require("express")
const Dashboard = require("./componets/dashboard")
const authAdminMiddleWare = require("../authAdminMiddleWare")

const route = express.Router()

route.get("/dashboard",authAdminMiddleWare,Dashboard)

module.exports = route