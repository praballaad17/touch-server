const { Schema, model } = require("mongoose")
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose');

const PostNotificationSchema = new Schema({
    user: {
        _id: ObjectId,
        username: String,
        fullName: String
    },
    notification: Array,
})

const PostNotification = mongoose.model('PostNotification', PostNotificationSchema);
module.exports = PostNotification;

const NotificationSchema = new Schema({
    user: {
        _id: ObjectId,
        username: String,
        fullName: String
    },
    notification: Array,
})

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;