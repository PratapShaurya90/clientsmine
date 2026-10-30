const express = require('express')
const router = express.Router();
const { Signup, Login, getMe, upgradePro, RefreshToken, Logout } = require('../controllers/authController')
const protect = require('../middlewares/auth')

router.post('/signup', Signup)
router.post('/login', Login)
router.get('/me', protect, getMe)
router.post('/upgrade', protect, upgradePro)
router.post('/refresh-token', RefreshToken)
router.post('/logout', protect, Logout)

module.exports = router