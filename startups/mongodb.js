const mongoose = require("mongoose");
// const multer = require("multer");
const crypto = require("crypto");
// const path = require("path");
// const auth = require("../middleware/auth");
const mongoURI = process.env.MONGOURI;

function mongofunction(app) {

  (async function () {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      });
      console.log('Connected to database');
    } catch (err) {
      console.error(err)
    }
  })();


  // const db = mongoose.connection;
  // db.on("error", console.error.bind(console, "Error connecting to db"));


}


module.exports = { mongoURI, mongofunction };
