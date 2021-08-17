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
  progress.style.width = progress.getAttribute('data-done') + '%';
  progress.style.opacity = 1;
  // create script that uses emits from contract and use those
  // to update the status bar value variable]
 
router.get('/', async (req, res) =>{
    // the list of articles
    console.log("index")
    var error = req.query.error;
    var structInfo = [];

    try{
        // get deployed blogg app
        var escrowApp = await ESCROW.deployed();
        //  get all struct info
        structInfo = await escrowApp.getSellerEscrowStruct(userId, i);
        structInfo.push

        console.log("Current-Number:", currentNumber);
        // create an array to store the articles in
        var articles = [];
        // for each of the articles
        for(var i=0;i<currentNumber;i++){

        }

        // render the list with array of articles
        res.render('', {
            articles: articles,
        })
    } catch(e){
        console.error("single error:",e);
        res.render('errorpage')
    }
})

});



//use description variable

module.exports = router;