const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

// Check if the incoming token is a valid token
const auth = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        // All the keys in "req.headers" are lowercase
        const token = req.headers.authorization.split(" ")[1];  // {"authorization": "Bearer JWT"}
        if (!token) {
            throw new Error("Authentication failed");
        }
        const payload = jwt.verify(token, process.env.JWT_PRIVATE_KEY); // if cannot verity, will throw an error
        req.userData = { userId: payload["userId"] };
        next();
    } catch (err) {
        return next(new HttpError("Authentication failed", 401));
    }
};

module.exports = auth; 