const express = require('express');
const router = express.Router();
const { getProfile, getStats } = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/profile', getProfile);
router.get('/stats', getStats);

module.exports = router;
