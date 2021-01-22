const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// virtual: derived property on schema, won't be stored in db. only work on schema
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200'); // change url for creating cloudinary thumbnail 
});

// mongoose by default don't include virtual when convert to JSON
const opts = { toJSON: { virtuals: true } };

const JazzbarSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// GeoJson require properties in "property" to be accessible
JazzbarSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/jazzbars/${this._id}">${this.title}</a></strong>`;
})


JazzbarSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})

module.exports = mongoose.model('Jazzbar', JazzbarSchema);