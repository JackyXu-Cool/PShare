const multer = require("multer");
const uuid = require("uuid/v1");

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpeg"
}

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, "uploads/images");
        },
        filename: (req, file, callback) => {
            const extentsion = MIME_TYPE_MAP[file.mimetype];
            callback(null, uuid() + "." + extentsion);
        }
    }),
    fileFilter: (req, file, callback) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];  // Get a value -> return true. Otherwise, false
        let error = isValid ? null : new Error("Invalid mime type");
        callback(error, isValid);
    }
}); // This is a middleware

module.exports = fileUpload