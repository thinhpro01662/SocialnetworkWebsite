const mongoose = require('mongoose')
const Schema = mongoose.Schema


const PostSchema = new Schema({
    email: String,
    name: String,
    content: String,
    imgavt: String,
    image: {
        data: Buffer,
        contentType: String
    },
    itype: String,
    createAt: {
        type: Date,
        default: Date.now
    }
})

PostSchema.virtual('imageSrc').get(function(){
    if (this.image != null && this.itype != null) {
        return `data:${this.itype};charset=utf-8;base64,${this.image.toString('base64')}`
    }
})


module.exports = mongoose.model('Post', PostSchema)