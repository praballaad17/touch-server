const express = require("express");
const user = require("./routes/user");
const auth = require("./routes/auth");
const post = require("./routes/post");
const http = require("http")
const socketio = require('socket.io');
const resize = require("./routes/fileResize");
require('dotenv').config()

const app = express();
require("./startups/cors")(app);
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
})
app.use(express.json({ limit: '50mb' }));
require("./startups/dotenv")();
const { mongofunction } = require("./startups/mongodb");
mongofunction(app);
require("./startups/socket")(io)

// app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/post", post);
app.use("/api/user", user);
app.use("/api/resize", resize);



const port = process.env.PORT || 3003;
server.listen(port, () => console.log(`Listening on port ${port}...`));