var express = require('express');
var router = express.Router();

const web3 = require("web3");
const toBN = web3.utils.toBN

const fetch = require("isomorphic-fetch");
const qs = require("qs");

const createContract = require("./transactions/create");
const setBuyer = require("./transactions/set-buyer");
const setSeller = require("./transactions/set-seller");
const buyerRecievedItem = require("./transactions/buyer-recieved-item");
const contractExpired = require("./transactions/contract-expired");


const { getContractDetails } = require("./transactions/get-contract-details");
const {
  ESCROW,
   GAS_LIMIT
} = require("./utils/truffle");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('createTrans', { title: 'create' });
});

async function fiatToEth(inValue){
  // euro = 2790

  // https://coinmarketcap.com/api/documentation/v1/#section/Quick-Start-Guide
  // https://coinmarketcap.com/api/documentation/v1/#operation/getV1ToolsPriceconversion
  const response = await fetch(
    "https://pro-api.coinmarketcap.com/v1/tools/price-conversion?" + qs.stringify({
      amount: inValue,
      id: 2790,
      convert: "ETH"
    }), {
      headers: {
        'X-CMC_PRO_API_KEY': "a77fa651-ef86-48e0-b13a-9acea836da18"
      }
    }
  );
  const json = await response.json();
  if(!response.ok){
    throw json;
  }
  var ethPrice = json.data.quote.ETH.price;

  var weiPrice = ethToWei(ethPrice.toString());

  console.log(weiPrice)

  var offset = weiPrice.modulo(3);
  if(offset.gt(0)){
    weiPrice = weiPrice.add(3).sub(offset);
  }
  offset = weiPrice.modulo(2);
  if(offset.gt(0)){
    weiPrice = weiPrice.add(3);
  }

  return weiPrice
}

function ethToWei(inValue){
  return web3.utils.toWei(inValue, "ether")
}

router.get("/fiat-to-eth", async (req, res)=>{
  try {
    const ret = {
      currencyIn: "EURO",
      valueIn: 100,
      currencyOut: "ETH",
      valueOut: await fiatToEth(100)
    }
    res.status(200).send(ret);
  }catch(e){
    res.status(500).send(e)
  }
})


router.get(createContract.URL_PATH, createContract.handleGet)

router.post(createContract.URL_PATH, createContract.handlePost);

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
  
    res.render('listTrans', { title: "List", buyArticles, sellArticles });
  }catch(e){
    console.log("list trans error:", e)
    res.status(500).json({ error: true})
  }

})

/*

*/
// "/trans/:id/set-buyer"
router.post(setBuyer.URL_PATH, setBuyer.handlePost);
router.get(setBuyer.URL_PATH, setBuyer.handleGet);

// "/trans/:id/set-seller"
router.post(setSeller.URL_PATH, setSeller.handlePost);
router.get(setSeller.URL_PATH, setSeller.handleGet);

// "/trans/:id/buyer-recieve-item"
router.post(buyerRecievedItem.URL_PATH, buyerRecievedItem.handlePost);
router.get(buyerRecievedItem.URL_PATH, buyerRecievedItem.handleGet);

// "/trans/:id/contract-expired"
router.post(contractExpired.URL_PATH, contractExpired.handlePost);
router.get(contractExpired.URL_PATH, contractExpired.handleGet);

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
      struct: struct
  });  
})

router.post("/received", async(req, res)=>{
  console.log(req.body);

  const escrowContract = await ESCROW.deployed();
  const confirmed = await escrowContract.buyerRecieveItem(
    req.body.contractAddress,
    {
      from: req.body.ethAddress,
      gas: GAS_LIMIT
    } 
  );
  res.redirect('/myTransactions')
})


router.post("/expired", async(req, res)=>{
  console.log(req.body);

  const escrowContract = await ESCROW.deployed();
  const expired = await escrowContract.contractExpired(
    req.body.contractAddress,
    {
      from: req.body.ethAddress,
      gas: GAS_LIMIT
    } 
  );
  res.redirect('/myTransactions')
})
module.exports = router;
