var express = require('express');
var router = express.Router();

const web3 = require("web3");
const fetch = require("isomorphic-fetch");
const qs = require("qs");

const truffleContract = require('truffle-contract');
const escrowConContract = require('../build/contracts/EscrowContainer.json');


var ESCROW = truffleContract(escrowConContract);
ESCROW.setProvider("http://127.0.0.1:7545/");

var GAS_LIMIT = 21 * 1000 + 1000 * 1000;

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
  return json.data.quote.ETH.price
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


router.get("/create", async (req, res)=>{
  res.render('createTrans', { title: 'create' });
})

router.post("/create", async (req, res)=>{
  try {
    console.log(req.body);
  
    //get fiate to eth onversion
    /*
    var convertedValue = await fiatToEth(req.body.value)
    console.log("create Eth:",convertedValue.toString())
    var weiValue = ethToWei(convertedValue.toString())
    console.log("create wei:",weiValue)
    */

    var escrowContract = await ESCROW.deployed();
    // run the function and pass in the value
    var escrow = await escrowContract.createEscrow(
      req.body.buyerOrSeller === "buyer",
      req.body.description,
      {
        from: req.body.ethAddress,
        value: req.body.value
      }
    )

    var ticker = await escrowContract.ticker.call();
    console.log("ticker in:", ticker)
    res.redirect("/trans/" + req.body.ethAddress);
  }catch(e){
    console.error("trans create error:",e);
    res.redirect("/trans/create");
  }
});

router.get("/users/:user_id", async(req, res)=>{
  try {
  // list all transactions of a particular person
  const userId = req.params.user_id;
  var escrowContract = await ESCROW.deployed();
  const [
    buyArticles,
    sellArticles
  ] = await Promise.all([
    Promise.resolve().then(async ()=>{
      const length = await escrowContract.getEscrowListLength(true, userId);
      console.log("buy length:", length)
      const articles = [];
      for(var i = 0; i < length; i++){
        const struc = await escrowContract.getBuyerEscrowStruct(userId, i);
        articles.push({
          contractAddress: struc.EscrowContract.toString(),
          sellerAddress: struc.seller.toString(),
          buyerAddress: struc.buyer.toString(),
          basePrice: struc.price.toString(),
          state: struc.state.toString(),
          description: struc.description.toString()
        });
      }
      return articles    
    }),
    Promise.resolve().then(async ()=>{
      const length = await escrowContract.getEscrowListLength(false, userId);
      console.log("buy length:", length)
      const articles = [];
      for(var i = 0; i < length; i++){
        const struc = await escrowContract.getSellerEscrowStruct(userId, i);
        articles.push({
          contractAddress: struc.EscrowContract.toString(),
          sellerAddress: struc.seller.toString(),
          buyerAddress: struc.buyer.toString(),
          basePrice: struc.price.toString(),
          state: struc.state.toString(),
          description: struc.description.toString()
        });
      }
      return articles    
    }),
  ])


  console.log("buyArticles:", buyArticles)
  console.log("sellArticles:", sellArticles)
  
    res.render('listTrans', { title: "List", buyArticles, sellArticles });
  }catch(e){
    console.log("list trans error:", e)
  }

})


router.get("/:transaction_id", async(req, res)=>{
  // can interact with one particular transaction
  // contractAddressToStruct

})

module.exports = router;
