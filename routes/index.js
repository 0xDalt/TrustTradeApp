var express = require('express');
var router = express.Router();

router.post('/add', function(req, res, next) {
   res.status(201).render('new', { isAdded : true } );
});


/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:users/id', function(req, res, next) {
  //look up user
  res.render({user: { id: req.params.id }})
});


module.exports = router;