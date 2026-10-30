const express = require('express')
const app = express()

const dotenv = require('dotenv')
dotenv.config();

const connectDB = require('./configs/db')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routers/authRoutes')
const clientRoutes = require("./routers/clientRoutes")
const leadRoutes = require("./routers/leadRoutes")

app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/ai", clientRoutes)
app.use("/api/leads", leadRoutes)

const PORT = process.env.PORT || 5000

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Started Successfully on PORT ${PORT}`)
        })
    })
    .catch((err) => {
        console.log("DB Connection Failed:", err)
})
