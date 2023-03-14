const { Schema, model } = require("mongoose")

const Group = new Schema({
    founders: Array,
    members: Array,
    membersId: Array,
    messages: Array

})

module.exports = model("Group", Group)