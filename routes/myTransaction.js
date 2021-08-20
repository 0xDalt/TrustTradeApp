var express = require('express');
var router = express.Router();
const truffleContract = require('truffle-contract');
const escrowConContract = require('../build/contracts/EscrowContainer.json');


var ESCROW = truffleContract(escrowConContract);
ESCROW.setProvider("http://127.0.0.1:7545/");

var GAS_LIMIT = 1000000;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('myTransaction', { title:req.body.description });
});

router.get('/', function(req, res, next) {
  
  const progress = document.querySelector('.progress-done');

});



//use description variable

module.exports = router;