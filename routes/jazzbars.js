const express = require('express');
const router = express.Router();
const jazzbars = require('../controllers/jazzbars');
const catchAsync = require('../utils/catchAsync');
const { validateJazzBar, isLoggedIn, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(jazzbars.index))                                                                      // index page: all bars
    .post(isLoggedIn, upload.array('image'), validateJazzBar, catchAsync(jazzbars.createJazzbar));        // add new bar: post

// add new bar: submission page only if logged in
router.get('/new', isLoggedIn, jazzbars.renderNewForm);

router.route('/:id')
    .get(catchAsync(jazzbars.showJazzbar))                                        // show bar details page
    .put(isLoggedIn, isAuthor, upload.array('image'), validateJazzBar, catchAsync(jazzbars.editJazzbar)) // update bar: update
    .delete(isLoggedIn, isAuthor, catchAsync(jazzbars.deleteJazzbar));            // delete bar

// update bar: form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(jazzbars.renderEditForm));

module.exports = router;