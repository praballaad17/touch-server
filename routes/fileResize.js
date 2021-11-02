const express = require("express");
const { resize } = require("../controllers/resizeControllers");
const router = express.Router();


router.post('/file', resize)

module.exports = router;
