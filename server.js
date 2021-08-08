const express = require("express");
// const users = require("./routes/users");
// const folders = require("./routes/folders");
const user = require("./routes/user");
const auth = require("./routes/auth");
const post = require("./routes/post");
require('dotenv').config()

const app = express();
app.use(express.json({ limit: '50mb' }));
require("./startups/cors")(app);
require("./startups/dotenv")();
const { mongofunction } = require("./startups/mongodb");
mongofunction(app);

// app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/post", post);
app.use("/api/user", user);

const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`Listening on port ${port}...`));
