const express = require('express')
const bodyParser = require('body-parser')
const models = require('./models')
const mustacheExpress = require('mustache-express')
const bcrypt= require('bcrypt')
const saltRounds = 10;
const app = express()

var session = require('express-session')



//session setup
app.use(session({
    secret:'travelBug',
    resave:false,
    saveUninitialized: true
}))
app.all('/login/*', authenticate)

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')

app.use(bodyParser.urlencoded({ extended: false }))

function authenticate(req,res,next){

    if(req.session){
        if(req.session.userId) {
            // go to the next/original request
            next()
          } else {
            res.redirect('/login')
          }
        } else {
            res.redirect('/login')
        }
    }

app.get('/login',(req, res)=> {
    res.render('login')
})

app.get('/register', (req,res)=>{
    res.render('register') 
})

app.post('/register',(req,res)=>{
  
    let username = req.body.username
    let password = req.body.password 

    

 bcrypt.hash(password, saltRounds, function(error, hash) {
    models.User.create({
        username: username,
        password: hash
    })
    .then(console.log("SUCCESS"))
     res.redirect('/login')
    })
})

app.post('/login', (req, res)=>{
    
    let memberU = req.body.memberU
    let memberP = req.body.memberP

    models.User.findOne({
        where: {
            username: memberU
        }
    })
    .then(function(user) {
        if (user === null) {
            res.render('login', {message: "Sorry invalid username and/or password"})
        }

        else {
            bcrypt.compare(memberP, user.password, function(err, result) {
                if(result) {
                    if(req.session) {
                        req.session.userId = user.id 
                    }

                    res.redirect('/homePage')
                }

                else {
                    res.render('login', {message: "Sorry invalid password"})
                }
            })
        }
    })


})

app.get('/login/homePage',(req, res)=>{
    res.render('homePage')
})

app.listen(3000,function(){
    console.log("Server is running...")
  })