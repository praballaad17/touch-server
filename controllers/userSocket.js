const Group = require("../models/Group")
const defaultValue = []

module.exports.retriveGroups = async (userId) => {
    return await Group.find({ membersId: userId })
}

module.exports.createGroups = async (founders, members, membersId) => {
    const group = new Group({ founders: founders, members: members, membersId: membersId, messages: defaultValue })
    await group.save()
    return group
}

module.exports.updateMessage = async (text, groupId, date, id) => {
    await Group.findByIdAndUpdate(groupId, {
        $push: { messages: { text, sender: id, date } }
    })
}