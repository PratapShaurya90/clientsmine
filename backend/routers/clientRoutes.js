const express = require('express')
const router = express.Router()
const aiClientAnalyze = require("../controllers/aiClientAnalyzer")
const getScrapingStatus = require("../controllers/statusController")
const protect = require('../middlewares/auth')

router.post("/client", protect, aiClientAnalyze)
router.get("/status/:messageId", protect, getScrapingStatus)

module.exports = router