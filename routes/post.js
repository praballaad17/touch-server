const express = require("express");
const { requireAuth } = require("../controllers/authControllers");
const router = express.Router();

const {
    postByUsername,
    retrivePostByUsername,
    getUserPhotosByUsername,
    retrivePostByUserId,
    deletePostById,
    getPostById,
    getTimelinePost,
    deleteComment
} = require('../controllers/postControllers');

const Post = require("../models/post");

router.delete('/delete-comment/:postId/:commentId', requireAuth, deleteComment)
router.get('/get-timeline-post/:userId', requireAuth, getTimelinePost)
router.get('/posts/:postId', requireAuth, getPostById);
router.post('/:username', requireAuth, postByUsername);
router.get('/userId/:userId', requireAuth, requireAuth, retrivePostByUserId);
router.get('/:username', requireAuth, retrivePostByUsername);
router.get('/user-posts/:username', requireAuth, getUserPhotosByUsername);
router.delete('/delete/:postId', requireAuth, deletePostById);
module.exports = router;
