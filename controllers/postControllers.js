// const cloudinary = require('cloudinary').v2;
// const linkify = require('linkifyjs'); 
// const axios = require('axios');
// require('linkifyjs/plugins/hashtag')(linkify);
const Post = require('../models/post');
const fs = require('fs')
const User = require('../models/user');
const Following = require('../models/Following');
const PaidPost = require('../models/paidPost');
const { post } = require('../routes/post');
// const Notification = require('../models/Notification');
// const socketHandler = require('../handlers/socketHandler');
// const fs = require('fs');
// const ObjectId = require('mongoose').Types.ObjectId;

module.exports.postByUsername = async (req, res) => {
    const { files, caption, postId, fileNames } = req.body;
    try {
        const post = new Post({
            _id: postId, files: files, fileNames: fileNames, fileNumber: files.length, caption: caption, author: req.params.username
        });

        await post.save();

        return res.status(201).json({ _id: post._id, fileNames: post.fileNames, fileNumber: post.fileNumber, caption, author: post.author });
    } catch (err) {
        console.log(err);
        res.status(400).send("unable to create post");
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

module.exports.getTimelinePosts = async (req, res) => {
    const { following } = await Following.findOne({ user: req.params.userId })
    following.push({ _id: req.params.userId })
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
    let posts = []

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    let results = {}

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
        const postArr = await Post.find({ author: { $in: followings } }, { files: 0 }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()

        results.result = postArr
        res.send(results)
    }
    catch (e) {
        res.status(500).json({ message: e.message })
    }
}

module.exports.getPostById = async (req, res) => {
    const { postId } = req.params
    const file = await Post.find({ _id: postId }, { files: 1 })
    return res.send(file[0]?.files)
}

module.exports.getUserPhotosByUsername = async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const logginUserId = req.query.logginUserId
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let posts = []
    let results = {}
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
        const post = await Post.find({ author: req.params.username }, { files: 0 }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()

        results.result = post
        return res.status(200).send(results)
    } catch (error) {
        return res.send(error)
    }
}

module.exports.deletePostById = async (req, res, next) => {
    try {
        await Post.findOneAndDelete({ _id: req.params.postId })
        res.status(200).send("deleted")
    } catch (error) {
        res.send(error)
    }
}





