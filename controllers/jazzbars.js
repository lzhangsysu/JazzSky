const Jazzbar = require('../models/jazzbar');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const jazzbars = await Jazzbar.find({});
    res.render('jazzbars/index', { jazzbars });
}

module.exports.renderNewForm = (req, res) => {
    res.render('jazzbars/new');
}

module.exports.createJazzbar = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.jazzbar.location,
        limit: 1
    }).send()
    const jazzbar = new Jazzbar(req.body.jazzbar);
    jazzbar.geometry = geoData.body.features[0].geometry;  // geoJson
    jazzbar.images = req.files.map( f => ({ url: f.path, filename: f.filename }));  // images
    jazzbar.author = req.user._id;
    await jazzbar.save();
    console.log(jazzbar);
    req.flash('success', 'Successfully added a new jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}

module.exports.showJazzbar = async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    // console.log(jazzbar);
    if (!jazzbar) {
        req.flash('error', 'Cannot find that jazz bar!');
        return res.redirect('/jazzbars');
    }
    res.render('jazzbars/show', { jazzbar });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id);
    if (!jazzbar) {
        req.flash('error', 'Cannot find that jazz bar!');
        return res.redirect('/jazzbars');
    }
    res.render('jazzbars/edit', { jazzbar });
}

module.exports.editJazzbar = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const jazzbar = await Jazzbar.findByIdAndUpdate(id, { ...req.body.jazzbar });
    const newImages = req.files.map( f => ({ url: f.path, filename: f.filename }));
    jazzbar.images.push(...newImages);  // add images
    await jazzbar.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); // remove from cloudinary
        }
        await jazzbar.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}}); // remove from mongodb
    } 
    req.flash('success', 'Successfully updated jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}

module.exports.deleteJazzbar = async (req, res) => {
    const { id } = req.params;
    await Jazzbar.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted jazz bar!');
    res.redirect('/jazzbars');
}