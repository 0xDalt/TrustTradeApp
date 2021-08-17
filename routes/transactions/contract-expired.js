const {
  ESCROW,
   GAS_LIMIT
} = require("../utils/truffle");


const URL_PATH = "/:id/contract-expired";

async function handlePost(req, res, next){
    console.log(req.body);

    const escrowContract = await ESCROW.deployed();
     console.log("request body:", req.body)
   
     var bigNum = await escrowContract.ticker.call()
     const prevBuyerNumb = bigNum.toNumber();
   
     console.log("before-Number:", prevBuyerNumb);
   
     const contractAddress = req.params.id;
     const struct = await escrowContract.contractAddressToStruct(contractAddress);
   
     var buyerEsc = await escrowContract.contractExpired(
       contractAddress,
       {
         from: req.body.ethAddress,
         gas: GAS_LIMIT
       } 
     );
     var bigNum = await escrowContract.ticker.call()
     const afterBuyerNumb = bigNum.toNumber();
     console.log("after-Number:", afterBuyerNumb);
   
     res.redirect("/createTrans")   
}

async function handleGet(req, res, next){
    const escrowContract = await ESCROW.deployed();
    console.log("request body:", req.body)
    const contractAddress = req.params.id;
    const struct = await escrowContract.contractAddressToStruct(contractAddress);
  
  
  
    res.render('transactions/contract-expired', {
        contractAddress: contractAddress,
        title: 'Contract Expired',
        struct: struct
    });  
}

module.exports = {
    URL_PATH,
    handlePost,
    handleGet
}