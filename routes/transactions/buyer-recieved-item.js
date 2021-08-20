const {
  ESCROW,
   GAS_LIMIT
} = require("../utils/truffle");


const URL_PATH = "/:id/buyer-recieved-item";

async function handlePost(req, res, next){
    console.log(req.body);

    const escrowContract = await ESCROW.deployed();
     console.log("request body:", req.body)
   
     var bigNum = await escrowContract.ticker.call()
     const prevBuyerNumb = bigNum.toNumber();
   
     console.log("before-Number:", prevBuyerNumb);
   
     const contractAddress = req.params.id;
     const struct = await escrowContract.contractAddressToStruct(contractAddress);
   
     var buyerEsc = await escrowContract.buyerRecieveItem(
       contractAddress,
       {
         from: req.body.ethAddress,
         gas: GAS_LIMIT
       } 
     );
     var bigNum = await escrowContract.ticker.call()
     const afterBuyerNumb = bigNum.toNumber();
     console.log("after-Number:", afterBuyerNumb);
   
     res.redirect("/trans/"+contractAddress)   
}

async function handleGet(req, res, next){
    const escrowContract = await ESCROW.deployed();
    console.log("request body:", req.body)
    const contractAddress = req.params.id;
    const struct = await escrowContract.contractAddressToStruct(contractAddress);
  
  
  
    res.render('transactions/buyer-recieved-item', {
        contractAddress: contractAddress,
        title: 'Buyer Has Recieved Item',
        struct: struct
    });  
}

module.exports = {
    URL_PATH,
    handlePost,
    handleGet
}