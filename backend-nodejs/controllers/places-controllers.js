const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fs = require("fs");

const HttpError = require("../models/http-error"); 
const Place = require("../models/place");
const User = require("../models/user");
const getCoordinatesForAddress = require("../util/location");

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

        const newPlace = new Place({
            title: title, 
            description: description,
            image: req.file.path,
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
            .json({place: newPlace.toObject( {getters: true} )});
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


exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserID = getPlacesByUserID;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.likePlace = likePlace;