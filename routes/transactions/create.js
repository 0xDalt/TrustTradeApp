const {
    ESCROW,
     GAS_LIMIT
  } = require("../utils/truffle");
  
const URL_PATH = "/create";

async function handlePost(req, res){
    try {
        console.log(req.body);
    
        var weiValue = req.body.value;
    
    
        var escrowContract = await ESCROW.deployed();
        // run the function and pass in the value
        var escrow = await escrowContract.createEscrow(
          req.body.buyerOrSeller === "buyer",
          req.body.description,
          {
            from: req.body.ethAddress,
            value: weiValue
          }
        )
    
        var ticker = await escrowContract.ticker.call();
        console.log("ticker in:", ticker)
        res.redirect("/trans/users/" + req.body.ethAddress);
    }catch(e){
        console.error("trans create error:",e);
        res.redirect("/trans/create");
    }
    
}

async function handleGet(req, res){
    console.log("Create Contract")
    res.render('createTrans', { title: 'create' });
}

module.exports = {
    URL_PATH,
    handlePost,
    handleGet
}