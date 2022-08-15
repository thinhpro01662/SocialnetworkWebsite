require('dotenv').config()
const express = require('express')
const {check, validationResult} = require('express-validator')
const Account = require('../database/Account')
const AccountSv = require('../database/AccountSv')
const Post = require('../database/Userpost')
const Announc = require('../database/Notification')
const jwt = require('jsonwebtoken')
const router = express.Router()
const passport = require('passport')
const alert = require('alert')
require('../passport')
const fs = require('fs')
router.use(passport.initialize())
router.use(passport.session())


router.get('/userlist', async function(req, res) {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    let accountt = await Account.find()
    accountt = accountt.reverse()
    const user = req.session.user
    return res.render('userlist', {user, accountt})
})

router.get('/userlist/delete/:id', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const { id } = req.params
    const acc = await Account.findByIdAndDelete(id)
    if (!acc) return res.status(404)
    return res.redirect(req.get('referer'));
})

router.get('/login', async (req, res)=>{
    if (req.session.user){
        return res.redirect('/')
    }
    const error = req.flash('error') || ''
    return res.render('login', {error})                
})

const loginValidator = [
    check('email').exists().withMessage('Vui lòng nhập tên đăng nhập').notEmpty().withMessage('Không được để trống tên đăng nhập').isLength({min: 6}).withMessage('Tên đăng nhập phải từ 6 ký tự'),
    check('password').exists().withMessage('Vui lòng nhập mật khẩu').notEmpty().withMessage('Không được để trống mật khẩu').isLength({min: 6}).withMessage('Mật khẩu không chính xavs'),
]
router.post('/login', loginValidator, (req, res)=>{
    let result = validationResult(req)
    if (result.errors.length === 0){
        let {email, password} = req.body
        let account = undefined
        Account.findOne({email: email})
        .then (acc => {
            if (!acc){
                req.flash('error', 'Email không tồn tại')
                return res.redirect('/user/login')
            }
            account = acc
            if (password != acc.password) {
                req.flash('error', 'Mật khẩu không chính xác')
                return res.redirect('/user/login')                
            }
            else {
                newemail = email.replace(/\./g,' ');
                let user = ({
                    email: email,
                    name: account.fullname,
                    department: account.department,
                    role: account.role,
                    img: newemail
                })
                console.log(acc.email)
                user.userRoot = `${req.vars.root}/users/`
                req.session.user = user
                req.app.use(express.static(user.userRoot))                    
                return res.redirect('/')
            }     
        })
        .catch(e => {
            req.flash('error', "Đăng nhập thất bại")
            return res.redirect('/user/login')           
        })
    }
    else {
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m]
            break
        }
        req.flash('error', message)
        res.redirect('/user/login')
    }
})

router.get('/register', (req, res)=>{
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const error = req.flash('error') || ''
    res.render('register', {error})
})


const regisvalidator = [
    check('name').exists().withMessage('Vui lòng nhập tên người dùng').notEmpty().withMessage('Không được để trống tên người dùng').isLength({min: 6}).withMessage('Tên người dùng phải từ 6 ký tự'),
    check('email').exists().withMessage('Vui lòng nhập địa chỉ email').notEmpty().withMessage('Không được để trống tên đăng nhập').isLength({min: 6}).withMessage('Tên đăng nhập phải từ 6 ký tự'),
    check('password').exists().withMessage('Vui lòng nhập mật khẩu').notEmpty().withMessage('Không được để trống mật khẩu').isLength({min: 6}).withMessage('Mật khẩu phải từ 6 ký tự'),
    check('rePassword').exists().withMessage('Vui lòng nhập xác nhận mật khẩu').notEmpty().withMessage('Vui lòng nhập xác nhận mật khẩu').custom((value, {req}) => {
        if (value !== req.body.password){
            throw new Error('Mật khẩu khồng khớp')
        }
        return true;
    })
]

router.post('/register', regisvalidator, (req, res)=>{
    let result = validationResult(req);
    if (result.errors.length === 0){
        let {name, department, email, password} = req.body
        Account.findOne({email: email})
        .then (acc => {
            if (acc){
                req.flash('error', "Tài khoản đã tồn tại")
                return res.redirect(req.get('referer'))
            }
        })
        .then(() => {
            let user = new Account({
                email: email,
                password: password,
                department: department,
                role: "manager",
                fullname: name
            })
            return user.save();
        })
        .then (() => {
            let avt = "avt"
            const {root} = req.vars
            const userDir = `${root}/users/${email}/${avt}` 
            fs.mkdir(userDir, {recursive: true}, ()=> {
                alert("Đăng ký thành công")
                return res.redirect(req.get('referer'))
            })         
        })
        .catch (e => {
            req.flash('error', 'Đăng ký thất bại')
            return res.redirect(req.get('referer'))                
        })
    }
    else {
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m]
            break
        }
        req.flash('error', "Vui lòng nhập đầy đủ thông tin")
        res.redirect(req.get('referer'))
    } 
})

router.get('/updateprofile1', (req, res)=>{
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const error = req.flash('error') || ''
    const user = req.session.user
    res.render('updateprofile1', {error, user})
})
router.get('/updateprofile2', (req, res)=>{
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const error = req.flash('error') || ''
    const user = req.session.user
    res.render('updateprofile2', {error, user})
})
router.get('/updateprofile3', (req, res)=>{
    if (!req.session.user){
        return res.redirect('/user/login')
    }
    const error = req.flash('error') || ''
    const user = req.session.user
    res.render('updateprofile3', {error, user})
})

const updatevalidator = [
    check('name').exists().withMessage('Vui lòng nhập tên người dùng').notEmpty().withMessage('Không được để trống tên người dùng').isLength({min: 6}).withMessage('Tên người dùng phải từ 6 ký tự'),
    check('password').exists().withMessage('Vui lòng nhập mật khẩu').notEmpty().withMessage('Không được để trống mật khẩu').isLength({min: 6}).withMessage('Mật khẩu phải từ 6 ký tự'),
    check('rePassword').exists().withMessage('Vui lòng nhập xác nhận mật khẩu').notEmpty().withMessage('Vui lòng nhập xác nhận mật khẩu').custom((value, {req}) => {
        if (value !== req.body.password){
            throw new Error('Mật khẩu khồng khớp')
        }
        return true;
    })
]
router.post('/updateprofile1', updatevalidator, async function (req, res){
    let result = validationResult(req);
    if (result.errors.length === 0){
        let {name, useremail, password} = req.body;
        Post.updateMany({email: useremail}, {$set: {name: name}}, function (err,res) {
            if (err) {console.log(err)};})
        Announc.updateMany({email: useremail}, {$set: {name: name}}, function (err,res) {
            if (err) {console.log(err)};})
        Account.findOne({email: useremail})
        .then (acc => {
            if (!acc){
                req.flash('error', "Không tìm thấy email")
                return res.redirect(req.get('referer'))
            }
        })
        .then(() => {
            Account.updateOne({email: useremail}, {$set: {fullname: name, password: password}}, function (err,res) {
                if (err) {console.log(err)};})
            newemail = useremail.replace(/\./g,' ');
            let user = ({
                email: useremail,
                name: name,
                role: "admin",
                img: newemail
            })
            user.userRoot = `${req.vars.root}/users/`
            req.session.user = user
            req.app.use(express.static(user.userRoot))                    
            return res.redirect('/')                
        })
        .catch (e => {
            req.flash('error', 'Cập nhật thất bại')
            return res.redirect(req.get('referer'))                
        })
    }
    else {
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m]
            break
        }
        req.flash('error', "Vui lòng nhập dầy đủ thông tin")
        res.redirect(req.get('referer'))
    } 
})

router.post('/updateprofile2', updatevalidator, (req, res)=>{
    let result = validationResult(req);
    if (result.errors.length === 0){
        let {name, useremail, password, department} = req.body
        Post.updateMany({email: useremail}, {$set: {name: name}}, function (err,res) {
            if (err) {console.log(err)};})
        Announc.updateMany({email: useremail}, {$set: {name: name}}, function (err,res) {
            if (err) {console.log(err)};})
        Account.findOne({email: useremail})
        .then (acc => {
            if (!acc){
                req.flash('error', "Không tìm thấy email")
                return res.redirect(req.get('referer'))
            }
        })
        .then(hashed => {
            Account.updateOne({email: useremail}, {$set: {fullname: name, password: password}}, function (err,res) {
                if (err) {console.log(err)};})
            newemail = useremail.replace(/\./g,' ');
            let user = ({
                email: useremail,
                name: name,
                department: department,
                role: "manager",
                img: newemail
            })
            user.userRoot = `${req.vars.root}/users/`
            req.session.user = user
            req.app.use(express.static(user.userRoot))                    
            return res.redirect('/')                
        })
        .catch (e => {
            req.flash('error', 'Cập nhật thất bại')
            return res.redirect(req.get('referer'))                
        })
    }
    else {
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m]
            break
        }
        req.flash('error', "Vui lòng nhập đầy đủ thông tin")
        res.redirect(req.get('referer'))
    } 
})

const updatevalidator1 = [
    check('name').exists().withMessage('Vui lòng nhập tên người dùng').notEmpty().withMessage('Không được để trống tên người dùng').isLength({min: 6}).withMessage('Tên người dùng phải từ 6 ký tự'),
]

router.post('/updateprofile3', updatevalidator1, (req, res)=>{
    let result = validationResult(req);
    if (result.errors.length === 0){
        let {name, department, classroom, useremail, img} = req.body
        Post.updateMany({email: useremail}, {$set: {name: name}}, function (err,res) {
            if (err) {console.log(err)};})
        Announc.updateMany({email: useremail}, {$set: {name: name}}, function (err,res) {
            if (err) {console.log(err)};})
        AccountSv.findOne({email: useremail})
        .then (acc => {
            if (!acc){
                req.flash('error', "Không tìm thấy email")
                return res.redirect(req.get('referer'))
            }
        })
        .then(() => {
            AccountSv.updateOne({email: useremail}, {$set: {fullname: name, class: classroom, department:department}}, function (err,res) {
                if (err) {console.log(err)};})
            newemail = useremail.replace(/\./g,' ');
            let user = ({
                email: useremail,
                name: name,
                department: department,
                role: "student",
                img: newemail,
                class: classroom
            })
            user.userRoot = `${req.vars.root}/users/`
            req.session.user = user
            req.app.use(express.static(user.userRoot))                    
            return res.redirect('/')                
        })
        .catch (e => {
            req.flash('error', 'Cập nhật thất bại')
            return res.redirect(req.get('referer'))                
        })
    }
    else {
        let messages = result.mapped()
        let message = ''
        for (m in messages){
            message = messages[m]
            break
        }
        req.flash('error',"Vui lòng nhập đầy đủ thông tin")
        res.redirect(req.get('referer'))
    } 
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/user/login')
})

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

router.get('/good', isLoggedIn, (req, res) =>{
    let {name, email} = {name:req.user.displayName, email:req.user.emails[0].value, pic:req.user.photos[0].value}
    console.log(email.includes('student.tdtu.edu.vn'));
    if (email.includes('student.tdtu.edu.vn') === true ){
        AccountSv.findOne({email: email})
        .then (acc => {
            if (acc){
                newemail = email.replace(/\./g,' ');
                let user = {name:acc.fullname, email:acc.email, role:acc.role, img:newemail}
                user.userRoot = `${req.vars.root}/users/`
                req.session.user = user
                req.app.use(express.static(user.userRoot))                    
                return res.redirect('/')
            }
        })
        .then(() => {
            let usernew = new AccountSv({
                email: email,
                role: "student",
                fullname: name
            })
            return usernew.save();
        })
        .then (() => {
            const {root} = req.vars
            let avt = "avt"
            const userDir = `${root}/users/${email}/${avt}` 
            fs.mkdir(userDir, {recursive: true}, ()=> {
                let user = {name:req.user.displayName, email:req.user.emails[0].value, pic:req.user.photos[0].value, role:"student"}
                user.userRoot = `${req.vars.root}/users/`
                req.session.user = user
                req.app.use(express.static(user.userRoot))                    
                return res.redirect('/')
            })
            return            
        })
        .catch (e => {
            req.flash('error', 'Đăng nhập thất bại')
            return res.redirect('/user/login')                
        })
    }
    else {
        req.flash('error', 'Email không phù hợp')
        return res.redirect('/user/login') 
    }
})

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/user/good');
  }
);

module.exports = router