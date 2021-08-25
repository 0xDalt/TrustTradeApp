const {
  ESCROW,
  ESCROW_CONTRACT_JSON,
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
  
    console.log("struct", struct)
  
    res.render('transactions/buyer-recieved-item', {
        contractAddress: contractAddress,
        title: 'Buyer Has Recieved Item',
        struct: struct,
        ESCROW_CONTRACT_ADDRESS: escrowContract.address,
        ESCROW_CONTRACT_JSON
    });  
}

module.exports = {
    URL_PATH,
    handlePost,
    handleGet
}