const express = require("express")
const Register = require("./componets/register")

const route = express.Router()


route.post("/register",Register)


module.exports = route