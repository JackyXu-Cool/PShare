const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const sgMail = require("../emails-service/account");
const htmlTemplate = require("../emails-service/template");

const getUsers = async (req, res, next) => {
    const users = await User.find({}, "-password");  // Hide password info
    res.json({users: users.map(user => 
        user.toObject( {getters: true} ))});
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
        'Signing up failed, please try again later.',
        500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
        'User exists already, please login instead.',
        422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
        'Could not create user, please try again.',
        500
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
        'Signing up failed, please try again later.',
        500
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
        { userId: createdUser.id, email: createdUser.email },
        process.env.JWT_PRIVATE_KEY,
        { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
        'Signing up failed, please try again later.',
        500
        );
        return next(error);
    }

    sgMail.send({
        to: email,
        from: {
            name: "PShare Development Team",
            email: "kevinxie.social@gmail.com"
        },
        subject: "Welcome to PShare",
        html: htmlTemplate
    })

    res.status(201)
        .json({ user: {userId: createdUser.id, email: createdUser.email, token: token} });
};

const logIn = async (req, res, next) => {
    const {email, password} = req.body;
    
    const user = await User.findOne({email: email});

    if (!user) {
        return next(new HttpError("Wrong credentials. Please try again", 401));
    }
    
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, user.password);
    } catch (err) {
        return next(new HttpError("Could not log you in", 500));
    }

    if (!isValidPassword) {
        return next(new HttpError("Wrong Credentials. Please try it again", 401));
    } else {
        let token;
        try {
            token = jwt.sign({userId: user.id, email: user.email}, 
                process.env.JWT_PRIVATE_KEY,
                {expiresIn: '1h'});
        } catch(err) {
            return next(new HttpError("Log In failed. Please try again.", 500));
        }
        res.json({ message: "log in", user: {userId: user.id, email: user.email, token: token} });
    }
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
