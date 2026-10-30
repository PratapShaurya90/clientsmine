const express = require('express');
const router = express.Router();
const { getLeads, getHistory } = require('../controllers/leadController');
const protect = require('../middlewares/auth');

router.get('/', protect, getLeads);
router.get('/history', protect, getHistory);

module.exports = router;
