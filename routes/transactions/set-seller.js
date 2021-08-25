const {
  ESCROW,
  ESCROW_CONTRACT_JSON,
   GAS_LIMIT
} = require("../utils/truffle");

const web3 = require("web3");
    // https://github.com/indutny/bn.js
const toBN = web3.utils.toBN


const URL_PATH = "/:id/set-seller";

async function handlePost(req, res, next){
    console.log(req.body);

    const escrowContract = await ESCROW.deployed();
     console.log("request body:", req.body)
   
     var bigNum = await escrowContract.ticker.call()
     const prevBuyerNumb = bigNum.toNumber();
   
     console.log("before-Number:", prevBuyerNumb);
   
     const contractAddress = req.params.id;
     const struct = await escrowContract.contractAddressToStruct(contractAddress);
    // https://github.com/indutny/bn.js
    const bnPrice = toBN(struct.price)
    const price = bnPrice.mul(toBN(2))
   
     var buyerEsc = await escrowContract.setSeller(
       contractAddress,
       {
         from: req.body.ethAddress,
         value: price,
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
    console.log(struct);
    // https://github.com/indutny/bn.js
    const bnPrice = toBN(struct.price)
    console.log(bnPrice);
    const price = bnPrice.mul(toBN(2))
    console.log(price);
 
    console.log("set seller handle get")
  
    res.render('transactions/set-seller', {
        contractAddress: contractAddress,
        title: 'Set Seller',
        price: price,
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