const express = require("express");
const router = express.Router();

const {
    getUserByUsername,
    getusersFollowers,
    getusersFollowersById,
    getUserDisplayImgs,
    updateProfileImg,
    removeProfileImg,
    getusersFollowing,
    updateFollowRequest,
    updateUnfollowRequest,
    searchUser
} = require('../controllers/userControllers');

router.get('/search/:usernameOrname', searchUser)
router.get('/display-imgs/:username', getUserDisplayImgs)
router.get('/username/:usernameOrEmail', getUserByUsername)
router.get('/username/followers/:username', getusersFollowers)
router.get('/username/following/:username', getusersFollowing)
router.put('/follow/:profileUserId', updateFollowRequest)
router.put('/unfollow/:profileUserId', updateUnfollowRequest)
router.get('/userId/followers/:profileUserId', getusersFollowersById)
router.put('/profile-img/:username', updateProfileImg)
router.delete('/profile-img/:username', removeProfileImg)


module.exports = router;