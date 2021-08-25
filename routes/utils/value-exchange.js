
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

    console.log("mod 6:",weiPrice, weiPrice.modulo(6) + 0 === 6);
  
    return weiPrice
  }
  
  function ethToWei(inValue){
    return web3.utils.toWei(inValue, "ether")
  }
  