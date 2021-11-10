const express = require("express");
const { requireAuth } = require("../controllers/authControllers");
const { resize } = require("../controllers/resizeControllers");
const router = express.Router();


router.post('/file', requireAuth, resize)

module.exports = router;
