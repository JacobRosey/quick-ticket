const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register);
//router.post('/database', authController.editRow);

module.exports = router;