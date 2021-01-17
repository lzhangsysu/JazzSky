const express = require('express');
const router = express.Router({mergeParams: true}); // to access params from jazzbar

const Jazzbar = require('../models/jazzbar');
const Review = require('../models/review');

const { reviewSchema } = require('../joiSchemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// middlewares to validate review data using Joi
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    // console.log(error);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

// add review
router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id);
    const review = new Review(req.body.review);
    jazzbar.reviews.push(review);
    await review.save();
    await jazzbar.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}))

// delete review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Jazzbar.findByIdAndUpdate(id, { $pull: { reviews: reviewId }}); // find bar and update by remove one review using reviewId
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/jazzbars/${id}`);
}))

module.exports = router;