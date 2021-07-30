var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'transaction' });
});

router.get('/:users/id', function(req, res, next) {
  //look up user
  res.render({user: { id: req.params.id }})
});

module.exports = router;