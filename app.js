const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

// require routes, set up route prefix
const jazzbars = require('./routes/jazzbars');
const reviews = require('./routes/reviews');

// connect to mongoose
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

// configurations
app.use(express.urlencoded({ extended: true })); // body parser
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // use public directory

// use routes
app.use('/jazzbars', jazzbars);
app.use('/jazzbars/:id/reviews', reviews);

// home page
app.get('/', (req, res) => {
    res.render('home');
});

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