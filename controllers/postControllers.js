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
    const { files, caption, paid, price } = req.body;
    let paidPost
    try {
        const post = new Post({
            files: files, caption: caption, author: req.params.username, paid: {
                isPaid: paid,
                price: price,
            }
        });
        if (paid) {
            paidPost = new PaidPost({ _id: post._id, author: req.params.username, price: price, paidUsers: [] })
            await paidPost.save();
        }
        await post.save();

        res.status(201).send(post);
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

module.exports.getTimelinePosts = async (req, res, next) => {
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
        const postArr = await Post.find({ author: { $in: followings } }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()
        for (let i = 0; i < postArr.length; i++) {
            if (postArr[i].paid.isPaid) {
                const paidPost = await PaidPost.findById(postArr[i]._id)
                const paiduser = paidPost.paidUsers.filter(item => item == req.params.userId)
                if (paiduser.length != 0) {
                    posts[i] = { post: postArr[i], hasPaid: true }
                }
                else {
                    posts[i] = { post: postArr[i], hasPaid: false }
                }
            }
            else {
                posts[i] = { post: postArr[i] }
            }

        }
    }
    catch (e) {
        res.status(500).json({ message: e.message })
    }
    results.result = posts
    res.send(results)
    // res.json(res.paginatedResults)
}


module.exports.getUserPhotosByUsername = async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const logginUserId = req.query.logginUserId
    console.log(logginUserId);
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let posts = []
    let results = {}

    try {
        const post = await Post.find({ author: req.params.username }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()
        const user = await User.findOne({ username: req.params.username })
        if (user._id == logginUserId) {
            // console.log(post);
            for (let i = 0; i < post.length; i++) {
                posts[i] = { post: post[i], hasPaid: true }
            }

        }
        else {
            for (let i = 0; i < post.length; i++) {
                if (post[i].paid.isPaid) {
                    const paidPost = await PaidPost.findById(post[i]._id)
                    const paiduser = paidPost.paidUsers.filter(item => item == logginUserId)
                    if (paiduser.length != 0) {
                        posts[i] = { post: postArr[i], hasPaid: true }
                    }
                }
            }
        }
        results.result = posts
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





