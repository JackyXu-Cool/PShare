const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, 
            required: true, 
            unique: true},  // "unique" property can help speed up the finding user by email property
    password: {type: String, required: true, minlength: 8},
    image: {type: String, required: true}, // An url to that image
    places: [{type: mongoose.Types.ObjectId, 
              required: true, 
              ref: 'Place'}] // An array. Each element is a Place-id 
});

userSchema.plugin(uniqueValidator); // By doing so, the "unique" property in "email" has a new feature
                                    // It can then check if that email is unique in the database

module.exports = mongoose.model("User", userSchema); 