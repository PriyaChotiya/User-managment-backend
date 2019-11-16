const express = require('express');

const router = express.Router();
const userController = require('../controllers').users;
const passport = require('../lib/passport/index');

// profile
router.get('/profile/:id', [passport], (req, res, next) => userController.getUserProfile(req, res, next));

// allUser
router.get('/users', [passport], (req, res, next) => userController.getAllUser(req, res, next));

// edit
router.post('/update', [passport], (req, res, next) => userController.update(req, res, next));

// delete
router.get('/delete/:id', [passport], (req, res, next) => userController.deleteUser(req, res, next));

// register handle or add user
router.post('/register', (req, res, next) => userController.registerUSer(req, res, next));

// Login handle
router.post('/login', (req, res, next) => userController.loginUser(req, res, next));

// Post Forgot
router.post('/forgot', (req, res, next) => userController.forgotPassword(req, res, next));

// reset password
// router.get('/reset', (req, res, next) => userController.getResetPassword(req, res, next));

// reset password post
router.post('/reset/:id', (req, res, next) => userController.setResetPassword(req, res, next));

// verify user login
router.get('/verify/:token', (req, res, next) => userController.verifyUser(req, res, next));

module.exports = router;
