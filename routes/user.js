var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var sqlite = require("better-sqlite3");
var bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  res.redirect("/users/login")
});

router.get('/logout', function(req, res, next) {
  res.cookie('token', '', {maxAge: 0})
  res.redirect("/users/login")
});

router.get('/login', async function (req, res) {
  var error = req.query.error;
  var address = req.query.address;
  if(req.cookies.token) {
    return res.redirect("/?address="+address)
  }
  res.render('login', { title: 'tradetrust', error:error });

});


router.post('/login', async function (req, res) {
  var currentAcc = req.body.currentAcc;
  var password = req.body.password;

  try {
    var db = new sqlite('database.db');
    var user = await db.prepare('SELECT * FROM users where address = (?)').get(currentAcc);
    if(bcrypt.compareSync(password, user.password)) {
      var token = jwt.sign({ user_id: user.id }, "SECRET_KEY" + currentAcc, { expiresIn: '7d' })
      res.cookie('token', token, {maxAge: 1000*60*60*24*7 })
    } else {
      res.redirect("/users/login?error=" + encodeURIComponent("wrong password"))
      return
    }
  } catch(err) {
    console.log(err)
  }
  
  res.redirect("/users/login?address="+currentAcc)

});


router.get('/register', async function (req, res) {
  res.render('register', { title: 'tradetrust', error: req.query.error });
});

router.post('/register', async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var currentAcc = req.body.currentAcc;
  try {
    var db = new sqlite('database.db');
    var user = await db.prepare('SELECT * FROM users where address = (?) or username = (?)').all(currentAcc, username);
    console.log(req.body)
    if(user.length) {
      res.redirect("/users/register?error=" + encodeURIComponent("already exists"))
      return
    } 
    var hash = await bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password, address) VALUES (?, ?, ?)').run(username, hash, currentAcc);
  
  } catch (err) {
    console.log(err)
  }

  res.redirect("/users/login")
});