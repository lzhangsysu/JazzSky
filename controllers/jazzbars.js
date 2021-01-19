const Jazzbar = require('../models/jazzbar');

module.exports.index = async (req, res) => {
    const jazzbars = await Jazzbar.find({});
    res.render('jazzbars/index', { jazzbars });
}

module.exports.renderNewForm = (req, res) => {
    res.render('jazzbars/new');
}

module.exports.createJazzbar = async (req, res, next) => {
    const jazzbar = new Jazzbar(req.body.jazzbar);
    jazzbar.author = req.user._id;
    await jazzbar.save();
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
    const jazzbar = await Jazzbar.findByIdAndUpdate(id, { ...req.body.jazzbar });
    req.flash('success', 'Successfully updated jazz bar!');
    res.redirect(`/jazzbars/${jazzbar._id}`);
}

module.exports.deleteJazzbar = async (req, res) => {
    const { id } = req.params;
    await Jazzbar.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted jazz bar!');
    res.redirect('/jazzbars');
}