const Notification = require('../models/notification');

module.exports.addNotificationByUsername = async (username, notification) => {
    try {
        await Notification.findOneAndUpdate({ "user.username": username }, {
            $push: {
                notification: [notification]
            }
        })
    }
    catch {
        console.log("error: Cannot update notification array!");
    }
}

module.exports.addNotificationById = async (username, notification) => {
    try {
        await Notification.findOneAndUpdate({ "user.username": username }, {
            $push: {
                notification: [notification]
            }
        })
    }
    catch {
        console.log("error: Cannot update notification array!");
    }
}

module.exports.getNotificationByUsername = async (req, res) => {
    console.log(req.params.username);
    try {
        const notification = await Notification.findOne({ "user.username": req.params.username })
        return res.status(200).send(notification)
    }
    catch {
        return res.status(400).send("error: Cannot update notification array!");
    }
}