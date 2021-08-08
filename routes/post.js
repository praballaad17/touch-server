const express = require("express");
const router = express.Router();

const {
    postByUsername,
    retrivePostByUsername,
    getUserPhotosByUsername,
    retrivePostByUserId,
    getTimelinePosts
} = require('../controllers/postControllers');
const Post = require("../models/post");

router.get('/all-posts/:userId', getTimelinePosts);
router.post('/:username', postByUsername);
router.get('/userId/:userId', retrivePostByUserId);
router.get('/:username', retrivePostByUsername);
router.get('/user-posts/:username', getUserPhotosByUsername);
module.exports = router;
