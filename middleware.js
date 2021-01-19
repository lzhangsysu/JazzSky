
const { jazzbarSchema, reviewSchema } = require('./joiSchemas.js');
const ExpressError = require('./utils/ExpressError');

const Jazzbar = require('./models/jazzbar');
const Review = require('./models/review');

// validate jazzbar data using Joi
module.exports.validateJazzBar = (req, res, next) => {
    const { error } = jazzbarSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

// check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

// checks if user is the author of post
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id);
    if (!jazzbar.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/jazzbars/${id}`);
    }
    next();
}

// checks if user is the author of review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/jazzbars/${id}`);
    }
    next();
}

// validate review data using Joi
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

