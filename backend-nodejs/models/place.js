const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    address: {type: String, required: true},
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true}
    },
    likes: {
        type: Number, required: true
    },
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}  // User's id (in mongodb object ID format)
})

module.exports = mongoose.model("Place", placeSchema);