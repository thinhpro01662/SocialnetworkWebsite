const express = require('express')
const Post = require('../database/Userpost')
const AccountSv = require('../database/AccountSv')
const router = express.Router()
const fs = require('fs')
const multer = require('multer')
const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif']

router.post('/', async (req, res) => {
    const userEmail = req.body.postEmail;
    const userName = req.body.postName;
    const content = req.body.content;
    const image = req.body.image || null
    const imgavt = userEmail.replace(/\./g,' ');
    const post = new Post({
        email: userEmail,
        name: userName,
        imgavt: imgavt,
        content: content
    })
    savePost(post, image)
    try {
        const newPost = await post.save()
        console.log("OK")
        return res.redirect(req.get('referer'))
    } catch (e) {
        console.log(e)
    }
})

router.get('/delete/:id', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const { id } = req.params
    const post = await Post.findByIdAndDelete(id)
    if (!post) return res.status(404)
    return res.redirect(req.get('referer'));
})

router.post('/update/:id', async (req, res) => {
    const { id } = req.params
    // const article = await Article.findByIdAndUpdate(id)
    // if (!article) return res.status(404)
    console.log(id)
    const content = req.body.content;
    const image = req.body.image || null

    const post = await Post.findById(id)
    post.content = content
    savePost(post, image)
    try {
        const updatedPost = await post.save()
        return res.redirect(req.get('referer'))
    } catch (e) {
        console.log(e)
    }
})

function savePost(post, imgEncoded) {
    if (imgEncoded == null) return;
    const img = JSON.parse(imgEncoded);
    if (img != null && imageMineTypes.includes(img.type)) {
        post.image = new Buffer.from(img.data, 'base64')
        post.itype = img.type
    }
}


router.get('/personalpage', async function(req, res) {
    const useremailid = req.query.useremailid;
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    let postt = await Post.find();
    postt = postt.reverse()
    let accountt = await AccountSv.find()
    accountt = accountt.reverse()
    const user = req.session.user
    return res.render('personalpage', {user, postt, accountt, useremailid})
})

module.exports = router