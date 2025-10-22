const express = require("express")
const cors = require('cors')
const app = express()
const PORT = 4000
const Auth = require("./auth/auth")
const User = require("./app/app")
const Flutter = require("./flutterWave/flutter")
const admin = require("./admin/admin")

app.use(cors({
    origin:"*"
}))

app.use(express.json())

app.use("/auth",Auth)
app.use("/user",User)
app.use("/flutter",Flutter)
app.use("/admin",admin)

app.listen(PORT,()=>{
    console.log(`Running on port ${PORT}`)
})