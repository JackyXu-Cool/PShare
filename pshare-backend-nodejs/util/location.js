const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyCCGvKYhnTXl_3IOR9upjZbSbndN52y1Rc";

async function getCoordinatesForAddress(address) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
    const data = response.data; // axios hold our data in "data" field

    if (!data || data.status === "ZERO_RESULTS") {
        const error = new HttpError("Could not find the location for the specified address", 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;
    return coordinates;
}

module.exports = getCoordinatesForAddress;