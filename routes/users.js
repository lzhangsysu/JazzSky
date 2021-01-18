const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

// register
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {  // login after signup
            if (err) return next(err);
            req.flash('success', `Welcome to Jazz Sky, ${registeredUser.username}`);
            res.redirect('/jazzbars');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// login
router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/jazzbars';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

// logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'See ya!');
    res.redirect('/jazzbars');
})

module.exports = router;