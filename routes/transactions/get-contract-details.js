
async function getContractDetails(escrowContract, userId){
  console.log("GET CONTRACT DETAILS")
    return await Promise.all([
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
          console.log("sell length:", length)
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
}

module.exports.getContractDetails = getContractDetails;