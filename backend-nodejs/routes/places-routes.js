const express = require("express");
const { check } = require("express-validator");

// Import places controller middleware function
const placesController = require("../controllers/places-controllers");

const authCheck = require("../middleware/auth");
const fileUpload = require("../middleware/file-upload");
const router = express.Router();

router.get("/user/:userid", placesController.getPlacesByUserID);

router.get("/:placeID", placesController.getPlaceByID);

router.patch("/likes/:placeID", placesController.likePlace);

// So "/user/:userid" and "/:placeID" requests will not be affected
router.use(authCheck);

router.post("/", 
    fileUpload.single("image"),
    [
        check('title').not().isEmpty(),
        check("description").isLength({ min: 5 }),
        check("address").not().isEmpty()
    ], 
    placesController.createPlace);

router.patch("/:placeID", 
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 })
    ],
    placesController.updatePlace);

router.delete("/:placeID", placesController.deletePlace);

module.exports = router;