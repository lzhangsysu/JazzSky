const express = require('express');
const router = express.Router({mergeParams: true}); // to access params from jazzbar
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');

// create review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;