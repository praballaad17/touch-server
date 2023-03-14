const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    _id: String,
    files: Array,
    fileNumber: Number,
    fileNames: Array,
    caption: String,
    comments: Array,
    hashtags: [
        {
            type: String,
            lowercase: true,
        },
    ],
    date: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: String,
        ref: 'User',
    },
    likes: Array

});

// PostSchema.pre('deleteOne', async function (next) {
//   const postId = this.getQuery()['_id'];
//   try {
//     await mongoose.model('PostVote').deleteOne({ post: postId });
//     await mongoose.model('Comment').deleteMany({ post: postId });
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;