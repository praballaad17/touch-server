const jwt = require('jwt-simple');
const { verifyJwt } = require('../controllers/authControllers');
const { getTimelinePost, getUserPost } = require('../controllers/postControllers');
const { UserDisplayImgsByUsername, getFollowersByusername, getUserByUsername } = require('../controllers/userControllers');
const { createGroups, updateMessage, retriveGroups } = require('../controllers/userSocket');

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
            if (!user) {
                console.log("disconnect");
                io.in(id).disconnectSockets();
                return Error(new Error('Not authorised.'));
            }

        }

        getUserDetailsByUsername(socket, username).then(user => {
            socket.emit('receive-logged-user', user)
        })

        // socket.on('first-conv', () => {
        //     console.log("first conversation");
        //     socket.emit("reseive-first conv", [{ postId: "12121212", name: "asdf" }, { postId: "12121212", name: "asdf" }])
        // })



        socket.on('fetch-user', (username) => {
            getUserDetailsByUsername(socket, username).then(user => {
                socket.emit('receive-user', user)
            })
        })
        socket.on('get-timeline', async ({ pageNumber, limit }) => {
            const posts = await getTimelinePost(id, pageNumber, limit)
            socket.emit("receive-timeline", posts)
        })

        socket.on('get-profile-post', async ({ username, pageNumber, limit }) => {
            const posts = await getUserPost(username, pageNumber, limit)
            socket.emit("receive-profile-post", { posts, username })
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

    })
};


const getUserDetailsByUsername = async (socket, rusername) => {
    const { displayImg } = await UserDisplayImgsByUsername(rusername)
    const followers = await getFollowersByusername(rusername)
    const following = await getFollowersByusername(rusername)
    const { _id, fullName, username, private } = await getUserByUsername(rusername)

    return { _id, fullName, username, private, followers, following, displayImg }
}

