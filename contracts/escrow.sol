pragma solidity ^ 0.8.0; 

library EscrowTypes {
    struct EscrowValues {
        address EscrowContract;
        address seller;
        address buyer;
        uint price;
    }
}

contract Escrow {
    struct details {
    address payable _seller;
    address payable _buyer;
    
<<<<<<< HEAD
    address payable public _seller;
    address payable public _buyer;
   
    uint public _price;
    string public description;
    uint public contractStart;

=======
    }
    uint public _price;
>>>>>>> 69415779fbd2c278ef3481319c3bb05c055f51a4

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

    ////Time constants
    uint constant one_day = 60*60*24;
    uint constant one_Week= one_day *7;
    
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
    
    constructor(bool isBuyer) payable {
<<<<<<< HEAD
        //what happens if not divisable, how does such statements define outcome
        contractStart = block.timestamp;
        if(isBuyer){
            setBuyer();
        } else {
=======

        require(msg.value % 6 == 0, "The price of the deposit must be divisible by 2 and 3");
//what happens if not divisable, how does such statements define outcome
        if(isBuyer){
            _price = msg.value / 3;
            setBuyer();
        } else {  //  is seller
            _price = msg.value / 2;
>>>>>>> 69415779fbd2c278ef3481319c3bb05c055f51a4
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
        if(block.timestamp >= contractStart + one_Week){
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
<<<<<<< HEAD

        if(block.timestamp >= contractStart + one_Week){
            if(address(this).balance > 0){
                return "ContractInactive";
            }
            return "finished";
        }


=======
    
>>>>>>> 69415779fbd2c278ef3481319c3bb05c055f51a4
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

    
    function setBuyer() payable public {
        require(block.timestamp < contractStart + one_Week, "contract is inactive");

        require(msg.value > 0, "The price of the deposit must be greater than 0");
        
        require(msg.value % 3 == 0, "The price of the deposit must be divisible by 2 and 3");
        // if price is not set
        if(_price == 0){
            // set the price to value / 3
            _price = msg.value / 3;
        }

        // Ensure buyer has not been set
        // https://ethereum.stackexchange.com/questions/6756/ways-to-see-if-address-is-empty/6762
        require(_buyer == address(0), "buyer address has not been set"); //makes ure the address is empty

        _buyer = payable(msg.sender);// set buyer to be sender

        require(msg.value == _price * 3, "the deposited value must equal to x * 3"); //make sure the value is price by 3

        require(!buyerHasDeposited, "Buyer has not yet deposited"); //make sure the buyer has not deposited yet

        buyerHasDeposited = true; //  if thats the case 
        emit Deposit(getCurrentState());

    }

    function setSeller() payable public {
        require(block.timestamp < contractStart + one_Week, "contract is inactive");

        require(msg.value > 0, "The price of the deposit must be greater than 0");
        
        require(msg.value % 2 == 0, "The price of the deposit must be divisible by 2 and 3");
        // if price is not set

        if(_price == 0){
            // set the price to value / 2
            _price = msg.value / 2;
        }

        // Ensure the seller has not been set
        require(_seller == address(0), "seller address has not been set");

        // if the seller has not been set and the state still needs addresses, set the seller to the msg.sender
        _seller = payable(msg.sender);
        
        require(msg.value == _price * 2, "the deposited value must equal to x * 2");

        require(!sellerHasDeposited, "Seller has not yet deposited");

        sellerHasDeposited = true;// if all that is true set sellerHasDeposited to true
        emit Deposit(getCurrentState());

    }
    
    
    function buyerRecieveItem() public {
        require(block.timestamp < contractStart + one_Week, "contract is inactive");
        require(getCurrentState() == ContractState.buyerHasNotRecievedItem, "Buyer should be waiting for item");
        require(msg.sender == _buyer, "Only the Buyer can state when they have recieved product");
        _buyer.transfer(_price * 2);
        _seller.transfer(_price * 3);
        buyerHasRecievedItem = true;
        emit Deposit(getCurrentState());
   }
   
   function contractExpired() public {
        require(block.timestamp >= contractStart + one_Week, "contract is still active");
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



    mapping (address => address[]) public buyerList;
    mapping (address => address[]) public sellerList;
  

    
    function getEscrowItem(bool fromBuyer, address user, uint item) public view returns (Escrow) {
        if(fromBuyer){
            address contractAddress = buyerList[user][item];
            return Escrow(contractAddress);
        } else {
            address contractAddress = buyerList[user][item];
            return Escrow(contractAddress);
        }
    }

}

contract Transaction is Escrow  {

    mapping (address => Escrow) _map;
    mapping (address => details) buyerT;
    mapping (address => details) sellerT ;


    // array with address
    buyerT [address] public buyerArr;
    sellerT [address] public sellerArr;

    string description;
    bool isBuyer;
    bool created;

    enum transactionState{
        TransactionAdded

    }

    event N (newContract update);

    //input total value euro.- use api for conversion
    //Repo: https://github.com/hunterlong/fiatcontract

    function createTransaction() public{
        // take in string des.
        // take in price.
       
        
    }

    
}