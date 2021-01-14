const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const { jazzbarSchema } = require('./joiSchemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Jazzbar = require('./models/jazzbar');

mongoose.connect('mongodb://localhost:27017/jazz-sky', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // body parser
app.use(methodOverride('_method'));

// middleware to validate jazz bar data using Joi
const validateJazzBar = (req, res, next) => {
    const { error } = jazzbarSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

// home page
app.get('/', (req, res) => {
    res.render('home');
});

// index page
app.get('/jazzbars', catchAsync(async (req, res) => {
    const jazzbars = await Jazzbar.find({});
    res.render('jazzbars/index', { jazzbars });
}));

// add new bar: submission page
app.get('/jazzbars/new', (req, res) => {
    res.render('jazzbars/new');
})

// add new bar: post
app.post('/jazzbars', validateJazzBar, catchAsync(async (req, res, next) => {
    // if (!req.body.jazzbar) throw new ExpressError('Invalid Jazz Bar Data', 400);
    const jazzbar = new Jazzbar(req.body.jazzbar);
    await jazzbar.save();
    res.redirect(`/jazzbars/${jazzbar._id}`);
}));

// show details page
app.get('/jazzbars/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findById(id);
    res.render('jazzbars/show', { jazzbar });
}));

// update bar: form
app.get('/jazzbars/:id/edit', catchAsync(async (req, res) => {
    const jazzbar = await Jazzbar.findById(req.params.id)
    res.render('jazzbars/edit', { jazzbar });
}));

// update bar: update
app.put('/jazzbars/:id', validateJazzBar, catchAsync(async (req, res) => {
    const { id } = req.params;
    const jazzbar = await Jazzbar.findByIdAndUpdate(id, { ...req.body.jazzbar });
    res.redirect(`/jazzbars/${jazzbar._id}`);
}));

// delete
app.delete('/jazzbars/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Jazzbar.findByIdAndDelete(id);
    res.redirect('/jazzbars');
}));

// all request, on all other paths, generate an ExpressError
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh No, Something Went Wrong!';
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});