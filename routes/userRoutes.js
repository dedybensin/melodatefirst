const express = require('express');
const userController = require('../controllers/userController');
const { register, login, logout } = userController;
const userAuth = require('../middlewares/userAuth');
const router = express.Router();

// Register Endpoint
router.post('/register', userAuth.saveUser, register);

// Login Route
router.post('/login', login );

// Logout Route
router.post('/logout', logout);

// Check Email Route
router.post('/checkEmail', userController.checkEmail);

module.exports = router;