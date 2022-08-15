const mongoose = require('mongoose')
const Schema = mongoose.Schema


const AccountSchema = new Schema({
    email: {
        type: String,
        unique: true,
    },
    fullname: String,
    class: String,
    department: String,
    role: String
})


module.exports = mongoose.model('AccountSv', AccountSchema)