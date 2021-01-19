const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateJazzBar, isLoggedIn, isAuthor } = require('../middleware');

const Jazzbar = require('../models/jazzbar');

// index page: all bars
router.get('/', catchAsync(async (req, res) => {
    const jazzbars = await Jazzbar.find({});
    res.render('jazzbars/index', { jazzbars });
}));

// add new bar: submission page only if logged in
router.get('/new', isLoggedIn, (req, res) => {
    res.render('jazzbars/new');
})

// add new bar: post
router.post('/', isLoggedIn, validateJazzBar, catchAsync(async (req, res, next) => {
    const jazzbar = new Jazzbar(req.body.jazzbar);
    jazzbar.author = req.user._id;
    await jazzbar.save();
    req.flash('success', 'Successfully added a new jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}));

// show bar details page
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    console.log(jazzbar);
    if (!jazzbar) {
        req.flash('error', 'Cannot find that jazz bar!');
        return res.redirect('/jazzbars');
    }
    res.render('jazzbars/show', { jazzbar });
}));

// update bar: form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id);
    if (!jazzbar) {
        req.flash('error', 'Cannot find that jazz bar!');
        return res.redirect('/jazzbars');
    }
    res.render('jazzbars/edit', { jazzbar });
}));

// update bar: update
router.put('/:id', isLoggedIn, isAuthor, validateJazzBar, catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findByIdAndUpdate(id, { ...req.body.jazzbar });
    req.flash('success', 'Successfully updated jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}));

// delete bar
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Jazzbar.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted jazz bar!');
    res.redirect('/jazzbars');
}));

module.exports = router;