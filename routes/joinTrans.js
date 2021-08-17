var express = require('express');
var router = express.Router();


/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('joinTrans', { title: 'Join Transaction' });
});



module.exports = router;