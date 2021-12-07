const jwt = require('jwt-simple');
const { verifyJwt } = require('../controllers/authControllers');
const { getTimelinePost, getUserPost, postByUsername, addCommentToPost, togglelike } = require('../controllers/postControllers');
const { UserDisplayImgsByUsername, getFollowersByusername, getFollowingByusername, getUserByUsernameSocket, updateFollowRequest, updateUnfollowRequest } = require('../controllers/userControllers');
const { createGroups, updateMessage, retriveGroups } = require('../controllers/userSocket');
const Notification = require('../models/notification')

module.exports = function (io) {

    io.on('connection', async (socket, next) => {
        const token = socket.handshake.query.jwt
        let id, username, user
        if (!token) return Error(new Error('No token provided.'));
        else {
            id = jwt.decode(token, process.env.JWT_SECRET).id
            username = jwt.decode(token, process.env.JWT_SECRET).username
            socket.join(id)
            console.log(id);
            user = await verifyJwt(token)
            console.log("jwt verified");
            if (!user) {
                console.log("disconnect");
                io.in(id).disconnectSockets();
                return Error(new Error('Not authorised.'));
            }

            async function emitLoggeduser() {
                const loggedinuser = await getUserDetailsByUsername(socket, username)
                console.log("emit looged in user");
                socket.emit('receive-logged-user', loggedinuser)
            }
            emitLoggeduser()
        }



        socket.on('fetch-user', (username) => {
            console.log("fetch users");
            getUserDetailsByUsername(socket, username).then(user => {
                socket.emit('receive-user', user)
            })
        })

        socket.on('get-groups', async () => {
            const groups = await retriveGroups(id)
            socket.emit('receive-groups', groups)
        })

        socket.on('create-new-group', async ({ selectedId, selected }) => {
            let members, membersId
            if (!selectedId.includes(id)) {
                members = [...selected, user]
                membersId = [...selectedId, id]
            }
            else {
                members = selected
                membersId = selectedId
            };
            const group = await createGroups([id], members, membersId)
            socket.emit("responce-create-new-group", group)
            const recipients = membersId.filter(m => m !== id)
            recipients.forEach(member => {
                socket.broadcast.to(member).emit('receive-new-group', group)
            })
        })

        socket.on('send-message', async ({ membersId, text, groupId, date }) => {
            const recipients = membersId.filter(m => m != id)

            await updateMessage(text, groupId, date, id)
            recipients.forEach(recipient => {
                const newRecipients = recipients.filter(r => r !== recipient)
                newRecipients.push(id)
                socket.broadcast.to(recipient).emit('receive-message', {
                    membersId, sender: id, text, date, groupId
                })
            })

        })

        socket.on('add-comment', async ({postId, comment}) => {
            console.log("add-comment");
            await addCommentToPost(postId, comment)
        })

        socket.on('post-feed', async ({ files, fileNames, postId, caption }) => {
            const post = await postByUsername(files, fileNames, postId, caption, username)
            const followers = await getFollowersByusername(username)
            followers.forEach(follower => {
                const id = follower._id.toString()
                socket.broadcast.to(id).emit('receive-post', post)
                socket.broadcast.to(id).emit('receive-postnoti', { author: post.author, caption: post.caption, date: post.date })
            })
        })

        socket.on('get-profileImg', async (username) => {
            const displayImg = await UserDisplayImgsByUsername(username)
            socket.emit('post-profileImg', displayImg)
        })

        socket.on('toggle-like', async({liked, postId, userId}) => {
            console.log(liked, postId, userId);
            await togglelike(liked, postId, userId)            
        })

        socket.on('follow', async ({ profileUserId, followingUserId }) => {
            await updateFollowRequest(profileUserId, followingUserId)
            const notification = {
                user: { _id: user._id, username: user.username, fullName: user.fullName },
                message: `${user.fullName} @${user.username} followed you.`,
                date: new Date()
            }
            await Notification.findOneAndUpdate({ "user._id": profileUserId }, {
                $push: {
                    notification: [notification]
                }
            })
            socket.broadcast.to(profileUserId).emit('follower-added', notification)
        })

        socket.on('unfollow', async ({ profileUserId, followingUserId }) => {
            await updateUnfollowRequest(profileUserId, followingUserId)
        })
    })
};


const getUserDetailsByUsername = async (socket, rusername) => {
    const { displayImg } = await UserDisplayImgsByUsername(rusername)
    const followers = await getFollowersByusername(rusername)
    const following = await getFollowingByusername(rusername)
    const { _id, fullName, username, private } = await getUserByUsernameSocket(rusername)

    return { _id, fullName, username, private, followers, following, displayImg }
}

