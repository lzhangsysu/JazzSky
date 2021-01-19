const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)      // register form
    .post(catchAsync(users.register));  // register new user

router.route('/login')
    .get(users.renderLoginForm)  // login form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);  // user login

// logout
router.get('/logout', users.logout);

module.exports = router;