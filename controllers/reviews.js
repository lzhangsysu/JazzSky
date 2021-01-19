const Jazzbar = require('../models/jazzbar');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    jazzbar.reviews.push(review);
    await review.save();
    await jazzbar.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Jazzbar.findByIdAndUpdate(id, { $pull: { reviews: reviewId }}); // find bar and update by remove one review using reviewId
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/jazzbars/${id}`);
}