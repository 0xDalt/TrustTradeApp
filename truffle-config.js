const { 
  infuraApiKey,
  infuraRopstenLocation,
  infuraRinkeyLocation,
  metaMnemonic
} = require('./secrets.json');
const rpcURL = "https://rinkeby.infura.io/v3/050425cddc83458a96e422bba186148a"
const HDWalletProvider = require("@truffle/hdwallet-provider");

console.log("provider:",infuraRopstenLocation)

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!
    networks: {

      /*
      https://www.trufflesuite.com/guides/using-infura-custom-provider#use-an-ether-faucet
      */
      ropsten: {
        provider: function(){
          return new HDWalletProvider(
            metaMnemonic, infuraRopstenLocation
          );
        },
        network_id: 3        
      },
      development: {
        host: "127.0.0.1",
        port: 7545,
        network_id: "*" // Match any network id
      },

      rinkeby: {
        provider: function(){
          return new HDWalletProvider(
            metaMnemonic, infuraRinkeyLocation
          );
        },
        network_id: 4
      }
    },
    compilers: {
      solc: {
        version: "^0.8.6"
      }
    }
  
  };
  