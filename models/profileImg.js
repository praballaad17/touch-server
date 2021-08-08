const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileImgSchema = new Schema({
    user: {
        type: mongoose.Schema(
            {
                username: {
                    type: String,
                },
                userId: {
                    type: String,
                }
            })
    },
    displayImg: {
        type: mongoose.Schema(
            {
                profileImg: {
                    type: String,
                },
                profileCover: {
                    type: String,
                }
            })
    }
});

const profileImgModal = mongoose.model('ProfileImg', ProfileImgSchema);
module.exports = profileImgModal;
