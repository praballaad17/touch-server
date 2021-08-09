const express = require("express");
const router = express.Router();

const {
    postByUsername,
    retrivePostByUsername,
    getUserPhotosByUsername,
    retrivePostByUserId,
    getTimelinePosts,
    deletePostById
} = require('../controllers/postControllers');
const Post = require("../models/post");

router.get('/all-posts/:userId', getTimelinePosts);
router.post('/:username', postByUsername);
router.get('/userId/:userId', retrivePostByUserId);
router.get('/:username', retrivePostByUsername);
router.get('/user-posts/:username', getUserPhotosByUsername);
router.delete('/delete/:postId', deletePostById);
module.exports = router;
