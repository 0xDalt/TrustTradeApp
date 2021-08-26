var express = require('express');
var router = express.Router();

const web3 = require("web3");
const toBN = web3.utils.toBN

const fetch = require("isomorphic-fetch");
const qs = require("qs");
const path = require("path");

const createContract = require("./transactions/create");
const setBuyer = require("./transactions/set-buyer");
const setSeller = require("./transactions/set-seller");
const buyerRecievedItem = require("./transactions/buyer-recieved-item");
const contractExpired = require("./transactions/contract-expired");

const { fiatToEth } = require("./utils/value-exchange");

const { getContractDetails } = require("./transactions/get-contract-details");
const {
  ESCROW,
  ESCROW_CONTRACT_JSON,
   GAS_LIMIT
} = require("./utils/truffle");

/* create page. */
router.get('/', async function(req, res, next) {
  console.log("Create Contract")
  var escrowContract = await ESCROW.deployed();

  console.log("escrowContract:", escrowContract.address);

  res.render('createTrans', {
      title: 'create',
      ESCROW_CONTRACT_ADDRESS: escrowContract.address,
      ESCROW_CONTRACT_JSON
  });
});

/* list users transactions */
router.get("/users/:user_id", async(req, res)=>{
  try {

    console.log("users transactions")
  // list all transactions of a particular person
  const userId = req.params.user_id;

  console.log("after user id")
  var escrowContract = await ESCROW.deployed();

  console.log("get escrow contract")
  const [
    buyArticles,
    sellArticles
  ] = await getContractDetails(escrowContract, userId)


  console.log("buyArticles:", buyArticles)
  console.log("sellArticles:", sellArticles)
  
    res.render('myTransaction', {
      title: "List",
      buyArticles,
      sellArticles,
      calculatePercent : (article)=>{
        console.log("article state:", article.state);
        switch(article.state) {
          case "finished": return 100;
          case "startOfContract": return 0;
          case "needsABuyer": return 33;
          case "needsASeller": return 33;
          case "buyerHasNotRecievedItem": return 66;
          case "ContractInactive": return 66;
          default: return 0;
        }
      }, mulPrice(input, multiplier){
        return toBN(input).mul(toBN(multiplier));
      }
    });
  }catch(e){
    console.log("list trans error:", e)
    res.status(500).json({ error: true})
  }

})

/* convert fiat to wei */
router.get("/fiat-to-eth", (req, res)=>{
  console.log("qs:",req.query);
  fiatToEth(req.query.amount).then((out)=>{
    res.json({
      euro: req.query.amount,
      wei: out
    })
  })
})

/* get single transaction */
router.get("/:transaction_id", async(req, res)=>{
  // should interact with one particular transaction
  // contractAddressToStruct

  const escrowContract = await ESCROW.deployed();
  console.log("request body:", req.body)
  const contractAddress = req.params.transaction_id;
  const struct = await escrowContract.contractAddressToStruct(contractAddress);
  console.log(struct);
  // https://github.com/indutny/bn.js
  const bnPrice = toBN(struct.price)


  res.render('transactions/single', {
      contractAddress: contractAddress,
      title: 'Set Seller',
      sellerPrice: bnPrice.mul(toBN(2)),
      buyerPrice: bnPrice.mul(toBN(3)),
      struct: struct,
      ESCROW_CONTRACT_ADDRESS: escrowContract.address,
      ESCROW_CONTRACT_JSON

  });  
})


module.exports = router;
