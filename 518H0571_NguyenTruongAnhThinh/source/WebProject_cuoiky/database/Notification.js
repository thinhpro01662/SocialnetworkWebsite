const mongoose = require('mongoose')
const Schema = mongoose.Schema


const NotificationSchema = new Schema({
    email: String,
    name: String,
    title: String,
    content: String,
    department: String,
    fileatm: {
        data: Buffer,
        contentType: String
    },
    itype: String,
    createAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Notification', NotificationSchema)