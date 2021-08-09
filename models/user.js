const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const RequestError = require('../errorTypes/RequestError');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address.');
            }
        },
    },
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        minlength: 3,
    },
    password: {
        type: String,
        minlength: 6,
    },
    avatar: String,
    bio: {
        type: String,
        maxlength: 130,
    },
    website: {
        type: String,
        maxlength: 65,
    },
    bookmarks: [
        {
            post: {
                type: Schema.ObjectId,
                ref: 'Post',
            },
        },
    ],
    private: {
        type: Boolean,
        default: false,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
});
UserSchema.pre('save', function (next) {
    const saltRounds = 10;
    // Check if the password has been modified
    if (this.modifiedPaths().includes('password')) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) return next(err);
                this.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.pre('save', async function (res, req, next) {
    if (this.isNew) {
        try {
            const document = await User.findOne({
                $or: [{ email: this.email }, { username: this.username }],
            });
            if (document) {
                const err = new Error('Username or email already register');
                return next(err)
            }
            // await mongoose.model('Followers').create({ user: this._id });
            // await mongoose.model('Following').create({ user: this._id });
        } catch (err) {
            return next(err);
        }
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
