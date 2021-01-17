const express = require('express');
const router = express.Router();

const { jazzbarSchema } = require('../joiSchemas.js');
const Jazzbar = require('../models/jazzbar');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// middlewares to validate jazzbar data using Joi
const validateJazzBar = (req, res, next) => {
    const { error } = jazzbarSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

// index page: all bars
router.get('/', catchAsync(async (req, res) => {
    const jazzbars = await Jazzbar.find({});
    res.render('jazzbars/index', { jazzbars });
}));

// add new bar: submission page
router.get('/new', (req, res) => {
    res.render('jazzbars/new');
})

// add new bar: post
router.post('/', validateJazzBar, catchAsync(async (req, res, next) => {
    // if (!req.body.jazzbar) throw new ExpressError('Invalid Jazz Bar Data', 400);
    const jazzbar = new Jazzbar(req.body.jazzbar);
    await jazzbar.save();
    req.flash('success', 'Successfully added a new jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}));

// show bar details page
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id).populate('reviews');
    if (!jazzbar) {
        req.flash('error', 'Cannot find that jazz bar!');
        return res.redirect('/jazzbars');
    }
    res.render('jazzbars/show', { jazzbar });
}));

// update bar: form
router.get('/:id/edit', catchAsync(async (req, res) => {
    const jazzbar = await Jazzbar.findById(req.params.id);
    if (!jazzbar) {
        req.flash('error', 'Cannot find that jazz bar!');
        return res.redirect('/jazzbars');
    }
    res.render('jazzbars/edit', { jazzbar });
}));

// update bar: update
router.put('/:id', validateJazzBar, catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findByIdAndUpdate(id, { ...req.body.jazzbar });
    req.flash('success', 'Successfully updated jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}));

// delete bar
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Jazzbar.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted jazz bar!');
    res.redirect('/jazzbars');
}));

module.exports = router;