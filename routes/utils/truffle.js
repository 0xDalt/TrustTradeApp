const truffleContract = require('truffle-contract');
const escrowConContract = require('../../build/contracts/EscrowContainer.json');
const contract = require('truffle-contract');

var ESCROW = truffleContract(escrowConContract);
ESCROW.setProvider("http://127.0.0.1:7545/");

var GAS_LIMIT = 21 * 1000 + 1000 * 1000;


module.exports = {
    ESCROW,
    GAS_LIMIT
}