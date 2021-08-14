var Escrow  = artifacts.require("./escrow.sol");

module.exports = function(deployer) {
  deployer.deploy(Escrow);
};
var EscrowContainer  = artifacts.require("./escrowContainer.sol");

module.exports = function(deployer) {
  deployer.deploy(EscrowContainer);
};