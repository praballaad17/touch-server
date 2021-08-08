const Followers = require('../models/Followers');
const Following = require('../models/Following');
const User = require('../models/User');
const ProfileImg = require('../models/profileImg');

module.exports.getusersFollowers = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const { followers } = await Followers.findOne({ user: user._id })
        res.send(followers)
    } catch (error) {
        res.send(error)
    }
}

module.exports.getusersFollowersById = async (req, res, next) => {
    try {
        const { followers } = await Followers.findOne({ user: req.params.userId })
        res.send(followers)
    } catch (error) {
        res.send(error)
    }
}

module.exports.getusersFollowing = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const { following } = await Following.findOne({ user: user._id })
        res.send(following)
    } catch (error) {
        res.send(error)
    }
}

module.exports.updateUnfollowRequest = async (req, res, next) => {
    console.log(req.params.profileUserId, req.body.followingUserId);
    try {
        await Followers.findOneAndUpdate({ user: req.params.profileUserId }, {
            $pull: {
                followers: { _id: req.body.followingUserId }
            }
        })
        await Following.findOneAndUpdate({ user: req.body.followingUserId }, {
            $pull: {
                following: { _id: req.params.profileUserId }
            }
        })
        res.status(200).send("unfollowed")
    } catch (error) {
        res.send(error)
    }
}

module.exports.getUserByUsername = async (req, res, next) => {
    const user = await User.findOne({
        $or: [{ email: req.params.usernameOrEmail }, { username: req.params.usernameOrEmail }],
    }).select("-password");
    res.send(user);
}

module.exports.updateFollowRequest = async (req, res, next) => {
    console.log(req.params.profileUserId, req.body.followingUserId);
    try {
        await Followers.findOneAndUpdate({ user: req.params.profileUserId }, {
            $push: {
                followers: [{ _id: req.body.followingUserId }]
            }
        })
        await Following.findOneAndUpdate({ user: req.body.followingUserId }, {
            $push: {
                following: [{ _id: req.params.profileUserId }]
            }
        })
        return res.status(200).send("followed")
    } catch (error) {
        return res.send(error)
    }
}

module.exports.updateProfileImg = async (req, res) => {
    const { profileImg } = req.body
    const userProfile = await ProfileImg.findOne({ "user.username": req.params.username })
    if (!userProfile) return res.status(400).send("Document Not found check the user database")

    const updateImg = await ProfileImg.findByIdAndUpdate(userProfile._id,
        {
            $set: {
                displayImg: {
                    profileImg: profileImg,
                }
            }
        }, { new: true })
    return res.send(updateImg)
}

module.exports.removeProfileImg = async (req, res) => {
    const userProfile = await ProfileImg.findOne({ "user.username": req.params.username })
    if (!userProfile) return res.status(400).send("Document Not found check the user database")

    const updateImg = await ProfileImg.findByIdAndUpdate(userProfile._id,
        {
            $set: {
                displayImg: {
                    profileImg: "",
                }
            }
        })
    return res.send(updateImg)
}

module.exports.getUserDisplayImgs = async (req, res) => {
    const userProfile = await ProfileImg.findOne({ "user.username": req.params.username })
    if (!userProfile) return res.status(400).send("Document Not found check the user database")

    // const result = await ProfileImg.findOne({ "user.username": req.params.username })
    return res.status(200).send(userProfile)
}
