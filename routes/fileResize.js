const express = require("express");
const { requireAuth } = require("../controllers/authControllers");
const { getNotificationByUsername } = require("../controllers/notiController");
const { resize } = require("../controllers/resizeControllers");
const router = express.Router();


router.post('/resize/file', requireAuth, resize)
router.get('/get-mention-notification/:username', getNotificationByUsername)

module.exports = router;
