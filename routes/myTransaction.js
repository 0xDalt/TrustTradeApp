var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'transkkaction' });
});

router.get('/', function(req, res, next) {
  
  const progress = document.querySelector('.progress-done');

  progress.style.width = progress.getAttribute('data-done') + '%';
  progress.style.opacity = 1;
  // create script that uses emits from contract and use those
  // to update the status bar value variable
});



//use description variable

module.exports = router;