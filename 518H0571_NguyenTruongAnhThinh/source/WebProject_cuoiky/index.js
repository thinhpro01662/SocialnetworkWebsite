require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const userRouter = require('./routers/userrouter')
const homeRouter = require('./routers/homepagerouter')
const anRouter = require('./routers/annorouter')
const FileReader = require('./fileReader')
const fs = require('fs')
const multer = require('multer')
const app = express()
const Posst = require('./database/Userpost')
const Announcement = require('./database/Notification')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser('thinh'));
app.use(session({     
    secret: 'cookie_secret',
    resave: true,
    saveUninitialized: true}));
app.use(flash());

const uploader = multer({dest: __dirname + '/uploads/'})

app.use((req, res, next) => {
    req.vars = {root: __dirname}
    next()
})

app.use('/user', userRouter)
app.use('/post', homeRouter)
app.use('/an', anRouter)

const getCurrentDir = (req, res, next) => {
    if(!req.session.user){
        return next();
    }
    const {userRoot} = req.session.user
    console.log(userRoot)
    let {dir} = req.query
    if (dir === undefined){
        dir = ''
    }
    let currentDir = `${userRoot}/${dir}`
    if (!fs.existsSync(currentDir)){
        currentDir = userRoot
    }
    req.vars.currentDir = currentDir
    req.vars.userRoot = userRoot
    next();
}

app.get('/', getCurrentDir, async function (req, res) {
    if (!req.session.user){
        return res.redirect('/user/login')
    }

    let {userRoot, currentDir} = req.vars
    //console.log('Can nap thu muc:' + currentDir)
    let posts = await Posst.find();
    posts = posts.reverse()
    let announ = await Announcement.find();
    announ = announ.reverse()
    FileReader.load(userRoot, currentDir)
    .then(files => {
        const user = req.session.user
        res.render('index', {user, files, posts, announ})
    })
})


app.post('/upload', uploader.single('attachment'), (req, res) => {
    const {email, path} = req.body
    const file = req.file
    if(!email || !path || !file){
        return console.log("Thông tin không hợp lệ")
    }

    const {root} = req.vars
    const currentPath = `${root}/users/${email}/${path}`

    if (!fs.existsSync(currentPath)){
        return console.log("Đường dẫn cần lưu không hợp lệ")
    }

    newemail = email.replace(/\./g,' ');
    let name = newemail + '.jpg'
    let newPath = currentPath + '/' + name

    fs.renameSync(file.path, newPath)
    
    return console.log("Upload thành công")
})


const port = process.env.PORT || 8080
mongoose.connect('mongodb+srv://admin123:Thinh01662645245@poorsocialwep.3cvs1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})
.then(() => {
    app.listen(port, ()=> {
        console.log('Sever listening to' + port)
    })
})
.catch(e => console.log('khong the ket noi toi db server:' + e.message))
