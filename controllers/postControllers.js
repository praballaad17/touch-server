
const Post = require('../models/post');
const User = require('../models/user');
const Following = require('../models/Following');
const PaidPost = require('../models/paidPost');
const { post } = require('../routes/post');


module.exports.postByUsername = async (req, res) => {
    const { files, caption, postId, fileNames } = req.body;
    try {
        const post = new Post({
            _id: postId, files: files, fileNames: fileNames, fileNumber: files.length, caption: caption, author: req.params.username
        });

        await post.save();

        return res.status(201).json({ _id: post._id, files, fileNames: post.fileNames, fileNumber: post.fileNumber, caption, author: post.author });
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

/****socket **************************************************************/
module.exports.getTimelinePost = async (id, pageNumber, limit) => {
    const { following } = await Following.findOne({ user: id })
    following.push({ _id: id })
    const resultArray = following.map(async (item) => {
        const result = await User.findById(item._id)
        if (!result) {
            return
        }
        return result.username
    })
    const followings = await Promise.all(resultArray);

    const startIndex = (pageNumber - 1) * limit
    const endIndex = pageNumber * limit

    let results = {}
    results.pageNumber = pageNumber

    if (endIndex < await Post.countDocuments().exec()) {
        results.hasMore = true
    } else {
        results.hasMore = false
    }
    try {
        const postArr = await Post.find({ author: { $in: followings } }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()
        results.result = postArr

        return results
    }
    catch (e) {
        return { message: e.message }
    }
}

module.exports.getUserPost = async (username, pageNumber, limit) => {

    const startIndex = (pageNumber - 1) * limit
    const endIndex = pageNumber * limit

    let results = {}
    if (endIndex < await Post.countDocuments().exec()) {
        results.next = {
            pageNumber: pageNumber + 1,
            limit: limit
        }
    }

    if (startIndex > 0) {
        results.previous = {
            pageNumber: pageNumber - 1,
            limit: limit
        }
    }
    try {
        const post = await Post.find({ author: username }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()

        results.result = post
        return results
    } catch (error) {
        return error
    }
}
/********************************************************************* */
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





