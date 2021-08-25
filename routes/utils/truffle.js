const truffleContract = require('truffle-contract');
const ESCROW_CONTRACT_JSON = require('../../build/contracts/EscrowContainer.json');
const truffleConfigs = require('../../truffle-config');
const truffleSecret = require('../../secrets.json');

var ESCROW = truffleContract(ESCROW_CONTRACT_JSON);

var provider = getProvider(truffleConfigs.networks, truffleSecret);

ESCROW.setProvider(handleProvider(provider));

var GAS_LIMIT = 21 * 1000 + 1000 * 1000;


module.exports = {
    ESCROW_CONTRACT_JSON,
    ESCROW,
    GAS_LIMIT
}

function getProvider(networks, secrets){
    if(secrets.provider && networks[secrets.provider]){
        return networks[secrets.provider];
    }

    if(!networks[process.env.TRUFFLE_PROVIDER]){
        console.error("No Valid truffle config: ", process.env.TRUFFLE_PROVIDER);
    } else {
        return networks[process.env.TRUFFLE_PROVIDER]
    }
    
    if(!provider){
        var firstProvider = Object.keys(networks)[0];
    
        if(!firstProvider){
            console.error("No first provider:", firstProvider);
        }
        return networks[firstProvider];
    }
    throw new Error("No valid network");
}

function handleProvider(provider){
    if(provider.host){
        return `http://${provider.host}:${provider.port || 80}`
    }
    if(provider.provider){
        return provider.provider()
    }
    console.error(provider);
    throw new Error("Unable to handle provider");
}

