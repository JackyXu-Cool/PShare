const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fs = require("fs");
const uuid = require("uuid/v1");
const redis = require("redis");

const HttpError = require("../models/http-error"); 
const Place = require("../models/place");
const User = require("../models/user");
const getCoordinatesForAddress = require("../util/location");
const uploadImageToS3 = require("../s3/s3upload");
const client = redis.createClient();

client.on("error", function(error) {
    console.log(error);
});

const getPlaceByID = async (req, res, next) => {
    place_id = req.params.placeID;
    
    const match_place = await Place.findById(place_id);

    if (!match_place) {
        next(new HttpError("Could not find the place with provided place id", 404))
    } else {
        return res.json({place: match_place.toObject({ getters: true })});
    }
};

const getPlacesByUserID = async (req, res, next) => {
    user_id = req.params.userid
    const match_places = await Place.find({creator: user_id});

    if (!match_places) {
        const error = new HttpError("Could not find the place for the provided user id", 404);
        next(error);
    } else {
        res.json({places: match_places.map(place => place.toObject({ getters: true }))});
    }
};

const likePlace = async (req, res, next) => {
    const place_id = req.params.placeID;

    const match_place = await Place.findById(place_id);

    match_place.likes = match_place.likes + 1;

    try {
        await match_place.save();
    } catch (err) {
        return next(HttpError("Something wrong when updating the data", 500));
    }

    res.json({ likes: match_place.likes });
};

const createPlace = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        next(new HttpError("Invalid input. Please check your data"), 422);
    } else {
        const { title, description, address } = req.body;

        let coordinates;
        try {
            coordinates = await getCoordinatesForAddress(address);
        } catch(err) {
            return next(err);
        }

        let imageIdAndType = `${uuid()}.${req.file.path.split(".")[1]}`;  // Format will be "1sdada.jpg"
        try {
            await uploadImageToS3(req.file.path, imageIdAndType);
        } catch(err) {
            const error = new HttpError(
                "Fail to upload the image to ther server. Try again later",
                500
            );
            return next(error);
        }

        const newPlace = new Place({
            title: title, 
            description: description,
            image: `https://elasticbeanstalk-us-east-2-252866775004.s3.us-east-2.amazonaws.com/images/${imageIdAndType}`,
            location: coordinates,
            address: address,
            likes: 0,
            creator: req.userData.userId
        });

        let user;
        try {
            user = await User.findById(req.userData.userId);
        } catch (err) {
            return next(new HttpError("Creating places failed. Please try again"), 500);
        }
        if (!user) {
            return next(new HttpError("Could not find users for provided ID"), 404);
        }

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await newPlace.save({ session: sess });
            user.places.push(newPlace);  // Since "user.places" is set to have "Object-id" type, only the 
                                        // the "newPlace"'s id will be stored
            await user.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            return next(new HttpError("Creating place failed. Please try it again.", 500));
        }

        res.status(201)
            .json({place: newPlace.toObject({ getters: true })});
    }
};

const updatePlace = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        next(new HttpError("Invalid input. Please check your data"), 422);
    } else {
        const { title, description } = req.body;
        const place_id = req.params.placeID;

        const match_place = await Place.findById(place_id);
        
        if (req.userData.userId !== match_place.creator.toString()) {
            return next(new HttpError("You are not allowed to edit this place", 401));
        }

        match_place.title = title;
        match_place.description = description;

        try {
            await match_place.save();
        } catch (err) {
            return next(HttpError("Something wrong when updating the data", 500));
        }

        res.json({update_place: match_place.toObject({getters: true})});
    }
};

const deletePlace = async (req, res, next) => {
    const place_id = req.params.placeID;

    const match_place = await Place.findById(place_id).populate("creator");

    if (!match_place) {
        return next(new HttpError("Could not find the place with provided ID", 404));
    }
    
    if (req.userData.userId !== match_place.creator.id) {
        return next(new HttpError("You are not allowed to delete it", 401));
    }

    const place_image_path = match_place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await match_place.remove({ session: sess });
        match_place.creator.places.pull(match_place);  // "match_place.creator" is the reference of the 
                                                      // corresponding user document.
        await match_place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("Something went wrong when deleting the place", 500));
    }

    fs.unlink(place_image_path, (err) => {
        console.log(err);
    });

    res.status(200)
        .json({message: "Place deleted"});
};


const savePlaceInfoInMemory = async (req, res, next) => {
    const { title, description, address } = req.body;
    client.set("title", title, function(err, res) {
        if (err) {
            return next(new HttpError("Something went wrong when saving in memory"));
        }
    });
    client.set("description", description, function(err, res) {
        if (err) {
            return next(new HttpError("Something went wrong when saving in memory"));
        }
    });
    client.set("address", address, function(err, res) {
        if (err) {
            return next(new HttpError("Something went wrong when saving in memory"));
        }
    });

    res.status(200)
        .json({message: "Place information saved"});
};

const getSavePlaceInfoInMemory = async (req, res, next) => {
    let title = "";
    let description = "";
    let address = "";
    client.get("title", function(err, value) {
        if (err) {
            return next(new HttpError("Something went wrong when fetching in memory data"));
        }
        title = value;
        client.get("description", function(err, value) {
            if (err) {
                return next(new HttpError("Something went wrong when fetching in memory data"));
            }
            description = value;
            client.get("address", function(err, value) {
                if (err) {
                    return next(new HttpError("Something went wrong when fetching in memory data"));
                }
                address = value;
                
                let data = {
                    title, description, address
                };
            
                res.status(200)
                    .json({data: data});
            });
        });
    });
};


exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserID = getPlacesByUserID;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.likePlace = likePlace;
exports.savePlaceInfoInMemory = savePlaceInfoInMemory;
exports.getSavePlaceInfoInMemory = getSavePlaceInfoInMemory;