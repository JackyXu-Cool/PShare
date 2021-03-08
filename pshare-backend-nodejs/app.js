const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept');
    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
    } else {
        //move on
        next();
    }
});

// Parse the request body from json to object format 
app.use(bodyParser.json());

// Route starts with "/places"
app.use("/places", placesRoutes);

// Route start with "/users"
app.use("/users", usersRoutes);

// For handling the error where the routes cannot be found (In other words: route does not start with
// "/users" or "/places")
app.use((req, res, next) => {
    const error = new HttpError("Could not find the route", 404);
    next(error);
});

// Error handling middleware (ALL error handling will go here)
app.use((error, req, res, next) => {
    // Delete the image if there's any error occur during the whole process
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    // Check if the response has been sent
    if (res.headerSent) {
        return next(error);  // forward the error
    } else {
        res.status(error.code || 500)
        .json({message: error.message || "An unknown error occurs"})
    }
});

mongoose.connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-ipy60.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    ).then(() => {
        app.listen(process.env.PORT || 8081);
    }).catch(err => {
        console.log(err);
    });
