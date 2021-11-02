const jwt = require('jwt-simple');
const crypto = require('crypto');
const User = require('../models/user');
const Followers = require('../models/Followers');
const Following = require('../models/Following');
const ConfirmationToken = require('../models/confirmationToken');
const profileImg = require('../models/profileImg');
const bcrypt = require('bcrypt');

// const {
//     sendConfirmationEmail,
//     generateUniqueUsername,
// } = require('../utils/validation');
const {
    validateEmail,
    validateFullName,
    validateUsername,
    validatePassword,
} = require('../utils/validation');

module.exports.verifyJwt = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const id = jwt.decode(token, process.env.JWT_SECRET).id;
            const user = await User.findOne(
                { _id: id },
                'email username avatar bookmarks bio fullName confirmed website'
            );
            if (user) {
                return resolve(user);
            } else {
                reject('Not authorized.');
            }
        } catch (err) {
            return reject('Not authorized.');
        }
    });
};

module.exports.requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).send({ error: 'Not authorized.' });
    try {
        const user = await this.verifyJwt(authorization);
        // Allow other middlewares to access the authenticated user details.
        res.locals.user = user;
        return next();
    } catch (err) {
        return res.status(401).send({ error: err });
    }
};

module.exports.optionalAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
        try {
            const user = await this.verifyJwt(authorization);
            // Allow other middlewares to access the authenticated user details.
            res.locals.user = user;
        } catch (err) {
            return res.status(401).send({ error: err });
        }
    }
    return next();
};

module.exports.loginAuthentication = async (req, res, next) => {
    const { authorization } = req.headers;
    const { usernameOrEmail, password } = req.body;
    if (authorization) {
        try {
            const user = await this.verifyJwt(authorization);
            return res.send({
                user,
                token: authorization,
            });
        } catch (err) {
            return res.status(401).send({ error: err });
        }
    }

    if (!usernameOrEmail || !password) {
        return res
            .status(400)
            .send({ error: 'Please provide both a username/email and a password.' });
    }

    try {
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
        if (!user || !user.password) {
            return res.status(401).send({
                error: 'The credentials you provided are incorrect, please try again.',
            });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return next(err);
            }
            if (!result) {
                return res.status(401).send({
                    error:
                        'The credentials you provided are incorrect, please try again.',
                });
            }

            res.send({
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                },
                token: jwt.encode({ id: user._id, username: user.username }, process.env.JWT_SECRET),
            });
        });
    } catch (err) {
        next(err);
    }
};

module.exports.register = async (req, res, next) => {
    const { username, fullName, email, password } = req.body;
    let user = null;
    let confirmationToken = null;

    const usernameError = validateUsername(username);
    if (usernameError) return res.status(400).send({ error: usernameError });

    const fullNameError = validateFullName(fullName);
    if (fullNameError) return res.status(400).send({ error: fullNameError });

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).send({ error: emailError });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).send({ error: passwordError });

    try {
        const document = await User.findOne({
            $or: [{ email: email }, { username: username }],
        });
        if (document) return res.status(400).send('Username or email already register')
        user = new User({ username, fullName, email, password });
        confirmationToken = new ConfirmationToken({
            user: user._id,
            token: crypto.randomBytes(20).toString('hex'),
        });
        const followers = new Followers({ user: user._id, followers: [] })
        const following = new Following({
            user: user._id, following: [
                { _id: "61115fb24b64ee0022c2282d" }
            ]
        })
        const displayImg = await profileImg({
            user: {
                username: username,
                _id: user._id
            },
            displayImg: {
                profileImg: "",
                profileCover: ""
            }
        })
        await user.save();
        await confirmationToken.save();
        await followers.save();
        await following.save();
        await displayImg.save()
        res.status(201).send({
            user: {
                email: user.email,
                username: user.username,
            },
            token: jwt.encode({ id: user._id, username: user.username }, process.env.JWT_SECRET),
        });
    } catch (err) {
        return res.send(err)
    }
    //   sendConfirmationEmail(user.username, user.email, confirmationToken.token);
};

module.exports.getUserById = async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password");
    res.send(user);
}

module.exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = res.locals.user;
    let currentPassword = undefined;

    try {
        const userDocument = await User.findById(user._id);
        currentPassword = userDocument.password;

        const result = await bcrypt.compare(oldPassword, currentPassword);
        if (!result) {
            return res.status('401').send({
                error: 'Your old password was entered incorrectly, please try again.',
            });
        }

        const newPasswordError = validatePassword(newPassword);
        if (newPasswordError)
            return res.status(400).send({ error: newPasswordError });

        userDocument.password = newPassword;
        await userDocument.save();
        return res.send();
    } catch (err) {
        return next(err);
    }
};
