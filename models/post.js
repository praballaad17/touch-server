const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    files: Array,
    thumbnail: String,
    caption: String,
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