const express = require('express')
const Announc = require('../database/Notification')
const AccountSv = require('../database/AccountSv')
const router = express.Router()
const fs = require('fs')



router.get('/department', async function (req, res) {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    let announce = await Announc.find();
    announce = announce.reverse()
    const user = req.session.user
    return res.render('department', {user, announce})
})

router.get('/announcement', async function (req, res) {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    let announce = await Announc.find();
    announce = announce.reverse()
    const user = req.session.user
    return res.render('announcement', {user, announce})
})

router.get('/room', async function (req, res) {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    let announce = await Announc.find();
    announce = announce.reverse()
    const user = req.session.user
    return res.render('room', {user, announce})
})

router.get('/announcement/delete/:id', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const { id } = req.params
    const announ = await Announc.findByIdAndDelete(id)
    if (!announ) return res.status(404)
    return res.redirect(req.get('referer'));
})

router.post('/announcement/update/:id', async (req, res) => {
    const { id } = req.params
    const postTitle = req.body.postTitle;
    const content = req.body.content;
    const image = req.body.image || null

    const announ = await Announc.findById(id)
    announ.content = content
    announ.title = postTitle
    savePost(announ, image)
    try {
        const updatedannoun = await announ.save()
        return res.redirect(req.get('referer'))
    } catch (e) {
        console.log(e)
    }
})

router.post('/department', async (req, res) => {
    const userEmail = req.body.postEmail;
    const userName = req.body.postName;
    const title = req.body.postTitle;
    const userDepart = req.body.postDepart;
    const content = req.body.content;
    const fileatm = req.body.fileatm || null
    const announc = new Announc({
        email: userEmail,
        name: userName,
        department: userDepart,
        title: title,
        content: content
    })
    savePost(announc, fileatm)
    try {
        const newannoun = await announc.save()
        console.log("OK")
        return res.redirect(req.get('referer'))
    } catch (e) {
        console.log(e)
    }
})

router.get('/department/delete/:id', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const { id } = req.params
    const announ = await Announc.findByIdAndDelete(id)
    if (!announ) return res.status(404)
    return res.redirect(req.get('referer'));
})

router.post('/department/update/:id', async (req, res) => {
    const { id } = req.params
    // const article = await Article.findByIdAndUpdate(id)
    // if (!article) return res.status(404)
    const content = req.body.content;
    const postTitle = req.body.postTitle;
    const image = req.body.image || null

    const announ = await Announc.findById(id)
    announ.content = content
    announ.title = postTitle
    savePost(announ, image)
    try {
        const updatedannoun = await announ.save()
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

router.get('/roomdetail', async function (req, res) {
    const roomTitle = req.query.roomTitle;
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    let announce = await Announc.find();
    announce = announce.reverse()
    const user = req.session.user
    return res.render('roomtitle', {user, announce, roomTitle})
})

module.exports = router;
