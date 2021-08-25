pragma solidity ^ 0.8.0; 

/*
https://ethereum.stackexchange.com/questions/28972/who-is-msg-sender-when-calling-a-contract-from-a-contract
use tx.origin instead of msg.sender

*/


/*
library
- good for structs and pure functions
- is not meant to be mutable like contracts are
*/

library EscrowTypes {
    // create our EscrowValue struct
    struct EscrowValues {
        address EscrowContract;
        address seller;
        address buyer;
        uint price;
        string state;
        string description;
    }
    
    
    ////Time constants
    uint constant one_day = 60*60*24;
    uint constant one_Week= one_day *7;
    uint constant one_month= one_Week *4;
    

}



contract Escrow {
    address payable public _seller;
    address payable public _buyer;
   
    uint public _price;
    string public description;
    uint public contractStart; // meant to test for inactivity


    bool buyerHasDeposited = false;
    bool sellerHasDeposited = false;
    bool buyerHasRecievedItem = false;
    

    enum ContractState{ 
            startOfContract,
            needsABuyer,
            needsASeller,
            buyerHasNotRecievedItem,
            finished,
            inactive,
            inactiveAndSentValues
    }
    
    event Deposit(ContractState update);
   
    /*********************
    buyer deposits in p * 3
    seller deposits in p * 2
        - when buyerRecievesItem
            - buyer gets back p * 2
            - seller gets p * 2 (their deposit's back) + y (is extra from the buyer)
    p*2 (for both users) = deposit 
    y = payment seller 
    ***************************/
    
    constructor(bool isBuyer, string memory _description) payable {
        // what happens if not divisable, how does such statements define outcome
        contractStart = block.timestamp;
        description = _description;
        if(isBuyer){
            setBuyer();
        } else {
            setSeller();
        }
    }
    
    function getCurrentState() public view returns (ContractState){
        /*
        startOfContract,
        needsABuyer,
        needsASeller,
        buyerHasNotRecievedItem,
        finished
        */
        if(block.timestamp >= contractStart + EscrowTypes.one_month){
            if(address(this).balance > 0){
                return ContractState.inactive;
            }
            return ContractState.finished;
        }
        
        address emptyAddress = address(0);
    
        if( _buyer == emptyAddress && _seller == emptyAddress){
            // never be true because the constructor creates either a buyer or seller
            return ContractState.startOfContract;
        }

        if( _buyer == emptyAddress ){
            return ContractState.needsABuyer; // there is no buyer contract state is needs a buyer
        }

        if( _seller == emptyAddress ){
            return ContractState.needsASeller; // there is no seller contract state is needs a seller
        }

        if(!buyerHasRecievedItem){

            return ContractState.buyerHasNotRecievedItem;
        }
        
        return ContractState.finished;
        
    }
    
    function getCurrentStateString() public view returns (string memory){
        /*
        startOfContract,
        needsABuyer,
        needsASeller,
        buyerHasNotRecievedItem,
        finished
        */
        
        address emptyAddress = address(0);

        if(block.timestamp >= contractStart + EscrowTypes.one_month){
            if(address(this).balance > 0){
                return "ContractInactive";
            }
            return "finished";
        }


        if( _buyer == emptyAddress && _seller == emptyAddress){
            // never be true because the constructor creates either a buyer or seller
            return "startOfContract";
        }

        if( _buyer == emptyAddress ){
            return "needsABuyer";
        }

        if( _seller == emptyAddress ){
            return "needsASeller";
        }

        if(!buyerHasRecievedItem){
            return "buyerHasNotRecievedItem";
        }
        
        return "finished";
        
    }
/*

the buyer puts in 3, gets out 2
the seller puts in 2, gets out 3

*/
    
    function setBuyer() payable public {
        require(block.timestamp < contractStart + EscrowTypes.one_Week, "contract is inactive");

        require(msg.value > 0, "The price of the deposit must be greater than 0");
        
        require(msg.value % 6 == 0, "The price of the deposit must be divisible by 2 and 3");
        // if price is not set
        if(_price == 0){
            // set the price to value / 3
            _price = msg.value / 3;
        }

        // Ensure buyer has not been set
        // https://ethereum.stackexchange.com/questions/6756/ways-to-see-if-address-is-empty/6762
        require(_buyer == address(0), "buyer address has not been set"); //makes ure the address is empty

        _buyer = payable(tx.origin);// set buyer to be sender

        require(msg.value == _price * 3, "the deposited value must equal to x * 3"); //make sure the value is price by 3

        require(!buyerHasDeposited, "Buyer has not yet deposited"); //make sure the buyer has not deposited yet

        buyerHasDeposited = true; //  if thats the case 

    }

    function setSeller() payable public {
        require(block.timestamp < contractStart + EscrowTypes.one_Week, "contract is inactive"); //best time suited to check for inactive?

        require(msg.value > 0, "The price of the deposit must be greater than 0");
        
        require(msg.value % 6 == 0, "The price of the deposit must be divisible by 2 and 3");
        // if price is not set

        if(_price == 0){
            // set the price to value / 2
            _price = msg.value / 2;
        }

        // Ensure the seller has not been set
        require(_seller == address(0), "seller address has not been set");

        // if the seller has not been set and the state still needs addresses, set the seller to the tx.origin
        _seller = payable(tx.origin);
        
        require(msg.value == _price * 2, "the deposited value must equal to x * 2");

        require(!sellerHasDeposited, "Seller has not yet deposited");

        sellerHasDeposited = true;// if all that is true set sellerHasDeposited to true

    }

    function buyerRecieveItem() public {
        require(block.timestamp < contractStart + EscrowTypes.one_Week, "contract is inactive");
        require(getCurrentState() == ContractState.buyerHasNotRecievedItem, "Buyer should be waiting for item");
        require(tx.origin == _buyer, "Only the Buyer can state when they have recieved product");
        _buyer.transfer(_price * 2);
        _seller.transfer(_price * 3);
        buyerHasRecievedItem = true;
   }
   
   function contractExpired() public {
        require(block.timestamp >= contractStart + EscrowTypes.one_month, "contract is still active");
        require(address(this).balance > 0, "contract needs to have value");
        if(_buyer != address(0)) {
            _buyer.transfer(_price * 3);
        }
        if(_seller != address(0)){
            _seller.transfer(_price * 2);
        }
   }
}



contract EscrowContainer  {

    uint public ticker;
    // have list and length for buy and seller contracts
    // the creators address -> the contract's address
    mapping (address => address[]) public buyerList;
    mapping (address => uint) public buyerListLength;
    mapping (address => address[]) public sellerList;
    mapping (address => uint) public sellerListLength;

   
    function getEscrowListLength(bool fromBuyer, address user) public view returns (uint) {
        if(fromBuyer){
            return buyerListLength[user];
        } else {
            return sellerListLength[user];
        }
    }

    function contractAddressToStruct(address contractAddress) public view returns (EscrowTypes.EscrowValues memory){
        //  cast the address to be the an instance of the contract
        Escrow e = Escrow(contractAddress);
        // create a struct which will be setting values to
        EscrowTypes.EscrowValues memory val;
        // set the contract address
        val.EscrowContract = contractAddress;
        // set the seller's address
        val.seller = e._seller();
        // set the buyers address
        val.buyer = e._buyer();
        //  set the base price (the seller will recieve 3 * the price and the buyer will recieve 2 * the price);
        val.price = e._price();
        // set the state so that the user has an idea of what has been done and what needs to be done 
        val.state = e.getCurrentStateString();
        // set the description
        val.description = e.description();

        // return the struct0
        return val;

    }

    function getBuyerEscrowStruct(address user, uint item) public view returns (EscrowTypes.EscrowValues memory) {
        // this function returns a struct 
        // This only will work if the item index is less than the length of the users addresses
        // checking the buyers list
        require(buyerListLength[user] > item, "requested item should be less than length");

        // get the list associated to the buyer's address and get the item's index
        address contractAddress = buyerList[user][item];
        // cast the address to be the an instance of the contract
        Escrow e = Escrow(contractAddress);
        // create struct which we will be setting values to
        EscrowTypes.EscrowValues memory val;
        // set the contract address
        val.EscrowContract = contractAddress;
        // set the seller's address
        val.seller = e._seller();
        // set the buyers address
        val.buyer = e._buyer();
        // set the base price (the seller will recieve 3 * the price and the buyer will recieve 2 * the price);
        val.price = e._price();
        // set the state so that the user has an idea of what has been done and what needs to be done 
        val.state = e.getCurrentStateString();

        // set the description
        val.description = e.description();

        // we return the struct0
        return val;
    }
    function getSellerEscrowStruct(address user, uint item) public view returns (EscrowTypes.EscrowValues memory) {
        // this is similar to the getBuyerEscrowStruct except it involves the sellers lists
        require(sellerListLength[user] > item, "requested item should be less than length");
        address contractAddress = sellerList[user][item];
        Escrow e = Escrow(contractAddress);
        EscrowTypes.EscrowValues memory val;
        val.EscrowContract = contractAddress;
        val.seller = e._seller();
        val.buyer = e._buyer();
        val.price = e._price();
        val.state = e.getCurrentStateString();
        val.description = e.description();
        return val;
    }

    function createEscrow(bool isBuyer, string memory description) external payable {
        ticker = msg.value;

        // https://ethereum.stackexchange.com/questions/62031/create-a-child-contract-from-a-parent-contract-and-forward-the-sender-amount-to?rq=1
        // pass value along to child contract
        Escrow newEscrow = new Escrow {value: msg.value }(isBuyer, description);
        // creating a new escrow item
        address newEscrowAddress = address(newEscrow);
        // can cast a contract to an address
        // https://ethereum.stackexchange.com/questions/66613/cast-contract-to-address-payable
        if(isBuyer){
            // if the isBuyer is true,
            // appending the newEscroAddress to the sender's buyerlist
            // this is done to have a list of all the contracts for that user
            buyerList[tx.origin].push(newEscrowAddress);
            buyerListLength[tx.origin]++;
        } else {
            // else we are appending the address to the senders sellerlist
            sellerList[tx.origin].push(newEscrowAddress);
            sellerListLength[tx.origin]++;
        }

    }

    function setBuyer(address contractAddress) external payable {
        ticker++;
        // getting the escrow object associated to the address 
        Escrow escrow = Escrow(contractAddress);
        // setting the buyer and sending the value
        escrow.setBuyer{value: msg.value }();
        // append the user's buyer list with the new contract address
        buyerList[tx.origin].push(contractAddress);
        buyerListLength[tx.origin]++;
    }

    function setSeller(address contractAddress) external payable {
        ticker++;
        // getting the escrow object associated to the address 
        Escrow escrow = Escrow(contractAddress);
        // setting the seller and sending the value
        escrow.setSeller{value: msg.value }();
        // append the user's seller list with the new contract address
        sellerList[tx.origin].push(contractAddress);
        sellerListLength[tx.origin]++;
    }
    function buyerRecieveItem(address contractAddress) external {
        ticker++;
        // getting the escrow object associated to the address 
        Escrow escrow = Escrow(contractAddress);
        // running the buyerRecieveItem function
        escrow.buyerRecieveItem();
    }

    function contractExpired(address contractAddress) external {
        // getting the escrow object associated to the address
        Escrow escrow = Escrow(contractAddress);
        // running the contractExpired function
        escrow.contractExpired();
    }

    function cleanUpLists(address contractAddress) external {
        ticker++;

        // getting the escrow object associated to the address from the argument
        Escrow escrowContract = Escrow(contractAddress);
        
        // only finished contracts should be able to be removed
        require(
            escrowContract.getCurrentState() == Escrow.ContractState.finished,
            "to remove the contract, the contract state should be finished"
        );

        // try to remove the item from the buyer list
        if(removeItemFromBuyerList(escrowContract)){
            // returns true if removed from list
            // subtract length by -1
            buyerListLength[escrowContract._buyer()]--;

            if(buyerListLength[escrowContract._buyer()] == 0){
                // if there are no more items in the list
                // delete the length and the list
                delete buyerListLength[escrowContract._buyer()];
                delete buyerList[escrowContract._buyer()];
                // https://ethereum.stackexchange.com/questions/15277/how-to-delete-an-element-from-a-mapping/15282
            }
        }
        // try to remove the item from the seller list
        if(removeItemFromSellerList(escrowContract)){
            // returns true if removed from list
            // subtract length by -1
            sellerListLength[escrowContract._seller()]--;
            if(sellerListLength[escrowContract._seller()] == 0){
                // if there are no more items in the list
                // delete the length and the list
                delete sellerListLength[escrowContract._seller()];
                delete sellerList[escrowContract._seller()];
            }
        }

    }

    function removeItemFromBuyerList(Escrow escrow) internal returns (bool){
        // With the escrow, get the buyer's address
        address buyer = escrow._buyer();
        // with the buyer's address, get the list associated with the buyer
        address[] storage buyerListOfAddress = buyerList[buyer];
        // and the length associated to that buyer's list
        uint length = buyerListLength[buyer];
        // With the escrow also get the address which looking to remove
        address contractAddress = address(escrow);

        /* to remove an item from the array,
            - the array
            - length of the array
            - the address thats being removed
        */
        return removeAddressFromArray(
            buyerListOfAddress,
            length,
            contractAddress
        );
    }
    function removeItemFromSellerList(Escrow escrow) internal returns (bool){
        // this function is similar to the one above featuring removing an item from the buyer's list
        address seller = escrow._seller();
        uint length = sellerListLength[seller];
        address contractAddress = address(escrow);

        // want to remove an entry from the list sellerList
        address[] storage sellerListOfAddress = sellerList[seller];
        
        return removeAddressFromArray(sellerListOfAddress, length, contractAddress);
   }

    
    function removeAddressFromArray(address[] storage list, uint length, address contractAddress) internal returns (bool){
        // if there are no items
        if(length == 0){
            // exit (return false because no item removed)
            return false;
        }
        // if the length is one
        if(length == 1){
            // test to see if the item is equal to the search address
            if(list[0] == contractAddress){
                // if yes, remove the item
                list.pop();
                // and return true
                return true;
            }
            // if the item is not equal, not removing it
            // return false
            return false;
        }
        // inorder to remove an item from an array
        // set the current item equal to the item that is 1 above it
        uint lastItem = length - 1;
        bool found = false;
        for(uint i; i < lastItem; i++){
            if(found){
                // already found the item
                //  setting the current item equal to the one above it
                list[i] = list[i + 1];
            } else if(list[i] == contractAddress){
                // if the current item is the address
                // set true
                found = true;
                // set the current item to the one above it
                list[i] = list[i + 1];
            }
        }
        if(!found && list[lastItem] == contractAddress){
            found = true;
        }
        if(found){
            //removing the last one if it was found
            list.pop();
            return true;
        }
        return false;
    }
}