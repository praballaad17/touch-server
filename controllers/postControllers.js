
const Post = require('../models/post');
const User = require('../models/user');
const Following = require('../models/Following');
const PaidPost = require('../models/paidPost');
const { post } = require('../routes/post');




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
module.exports.getTimelinePost = async (req, res) => {
    const {userId: id} = req.params 
    const pageNumber = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
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
    console.log(await Post.countDocuments({ author: { $in: followings }}).exec());
    if (endIndex < await Post.countDocuments({ author: { $in: followings }}).exec()) {
        results.hasMore = true
    } else {
        results.hasMore = false
    }
    try {
        const postArr = await Post.find({ author: { $in: followings } }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()
        results.result = postArr

        return res.status(200).send( results)
    }
    catch (e) {
        return res.status(400).send(e.message )
    }
}
/****socket **************************************************************/
module.exports.postByUsername = async (files, fileNames, postId, caption, username) => {
    try {
        const post = new Post({
            _id: postId, files: files, fileNames: fileNames, fileNumber: files.length, caption: caption, author: username
            , comments: []
        });

        await post.save();
        return post
    } catch (err) {
        console.log(err);
        return "unable to create post"
    }
}
// module.exports.getTimelinePost = async (id, pageNumber, limit) => {
//     const { following } = await Following.findOne({ user: id })
//     following.push({ _id: id })
//     const resultArray = following.map(async (item) => {
//         const result = await User.findById(item._id)
//         if (!result) {
//             return
//         }
//         return result.username
//     })
//     const followings = await Promise.all(resultArray);

//     const startIndex = (pageNumber - 1) * limit
//     const endIndex = pageNumber * limit

//     let results = {}
//     results.pageNumber = pageNumber

//     if (endIndex < await Post.countDocuments().exec()) {
//         results.hasMore = true
//     } else {
//         results.hasMore = false
//     }
//     try {
//         const postArr = await Post.find({ author: { $in: followings } }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()
//         results.result = postArr

//         return results
//     }
//     catch (e) {
//         return { message: e.message }
//     }
// }
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
module.exports.togglelike = async (liked, postId, userId) => {
    console.log(liked, postId, userId);
    if(liked) {
        await Post.findByIdAndUpdate(postId, {
            $push: {
                likes: userId
            }
        })
    } else {
        await Post.findByIdAndUpdate(postId, {
            $pull: {
                likes: userId
            }
        })
    }
}
/********************************************************************* */

module.exports.getPostById = async (req, res) => {
    const { postId } = req.params
    const file = await Post.findOne({ _id: postId })
    return res.send(file)
}

module.exports.addCommentToPost = async (postId, comment) => {
    await Post.findByIdAndUpdate(postId, {
        $push: {
            comments: comment
        }
    })
}

module.exports.deleteComment = async (req, res) => {
    const {postId, commentId} = req.params
    await Post.findByIdAndUpdate(postId, {
        $pull: {
            comments: {
                _id: commentId
            }
        }
    })
    return res.status(202).send("deleted comment")
}

module.exports.getUserPhotosByUsername = async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

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
        const post = await Post.find({ author: req.params.username }).sort([['date', -1]]).limit(limit).skip(startIndex).exec()

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





