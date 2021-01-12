const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Jazzbar = require('../models/jazzbar');

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

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// fake seed data to populate db
const seedDB = async () => {
    await Jazzbar.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const jazzbar = new Jazzbar({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/9803714/',
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quia, obcaecati accusantium! Aperiam, ut harum quaerat voluptatem blanditiis qui sed, suscipit quos enim possimus temporibus quidem laborum libero facere. Id, neque!',
            price
        });
        await jazzbar.save();
    }
}

// execute seeds then close
seedDB().then(() => {
    mongoose.connection.close()
});