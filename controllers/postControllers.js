// const cloudinary = require('cloudinary').v2;
// const linkify = require('linkifyjs'); 
// const axios = require('axios');
// require('linkifyjs/plugins/hashtag')(linkify);
const Post = require('../models/post');
const fs = require('fs')
const User = require('../models/user');
const Following = require('../models/Following');
// const Notification = require('../models/Notification');
// const socketHandler = require('../handlers/socketHandler');
// const fs = require('fs');
// const ObjectId = require('mongoose').Types.ObjectId;

module.exports.postByUsername = async (req, res, next) => {
    const { files, caption } = req.body;
    try {
        post = new Post({ files: files, caption: caption, author: req.params.username });
        await post.save();
        res.status(201).send(post);
    } catch (err) {
        res.status(400).send(err, "unable to create post");
    }
}
module.exports.retrivePostByUsername = async (req, res, next) => {
    try {
        const post = await Post.findOne({ author: req.params.username })
        res.send(post)
    } catch (error) {
        res.send(error)
    }
}

module.exports.retrivePostByUserId = async (req, res, next) => {
    const user = await User.findById(req.params.userId)
    try {
        const post = await Post.findOne({ author: user?.username })
        res.send(post)
    } catch (error) {
        res.send(error)
    }
}

module.exports.getTimelinePosts = async (req, res, next) => {
    const { following } = await Following.findOne({ user: req.params.userId })
    const resultArray = following.map(async (item) => {
        const result = await User.findById(item._id)
        if (!result) {
            return
        }
        return result.username
    })
    const followings = await Promise.all(resultArray);
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    if (endIndex < await Post.countDocuments().exec()) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }
    try {
        results.results = await Post.find({ author: { $in: followings } }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()
        res.send(results)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
    // res.json(res.paginatedResults)
}

module.exports.getUserPhotosByUsername = async (req, res, next) => {
    try {
        const post = await Post.find({ author: req.params.username })
        res.send(post)
    } catch (error) {
        res.send(error)
    }
}




