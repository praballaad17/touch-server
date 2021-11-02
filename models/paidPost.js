const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaidPostSchema = new Schema({
    postId: Schema.ObjectId,
    date: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: String,
        ref: 'User',
    },
    paidUsers: [
        {
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            }
        }
    ],
    price: String
});


const PaidPost = mongoose.model('PaidPost', PaidPostSchema);
module.exports = PaidPost;