const {
  ESCROW,
   GAS_LIMIT
} = require("../utils/truffle");

const web3 = require("web3");
    // https://github.com/indutny/bn.js
const toBN = web3.utils.toBN;


const URL_PATH = "/:id/set-buyer";

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
     const price = bnPrice.mul(toBN(3))
   
     var buyerEsc = await escrowContract.setBuyer(
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
    // https://github.com/indutny/bn.js
    const bnPrice = web3.utils.toBN(struct.price)
    const price = bnPrice.mul(toBN(3))
  
  
  
    res.render('transactions/set-buyer', {
        contractAddress: contractAddress,
        title: 'Set Buyer',
        price: price,
        struct: struct
    });  
}

module.exports = {
    URL_PATH,
    handlePost,
    handleGet
}