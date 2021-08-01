pragma solidity ^ 0.8.0; 

contract Escrow {
    
    address payable seller;
    address payable buyer;
    uint public price;

    bool buyerHasDeposited = false;
    bool sellerHasDeposited = false;
    bool buyerHasRecievedItem = false;
    

    enum    ContractState{ 
            startOfContract,
            needsABuyer,
            needsASeller,
            buyerHasNotRecievedItem,
            finished,
            inactive
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
            - seller gets p * 2 (their deposit back) + y (is extra from the buyer)
    p*2 (for both users) = deposit 
    y = payment seller 
    ***************************/
    
    constructor(bool isBuyer) payable {

        require(msg.value % 6 == 0, "The price of the deposit must be divisible by 2 and 3");

        if(isBuyer){
            price = msg.value / 3;
            setBuyer();
        } else {  //  is seller
            price = msg.value / 2;
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
        
        address emptyAddress = address(0);
    
        if( buyer == emptyAddress && seller == emptyAddress){
            // never be true because the constructor creates either a buyer or seller
            return ContractState.startOfContract;
        }

        if( buyer == emptyAddress ){
            return ContractState.needsABuyer; // there is no buyer contract state is needs a buyer
        }

        if( seller == emptyAddress ){
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
    
        if( buyer == emptyAddress && seller == emptyAddress){
            // never be true because the constructor creates either a buyer or seller
            return "startOfContract";
        }

        if( buyer == emptyAddress ){
            return "needsABuyer";
        }

        if( seller == emptyAddress ){
            return "needsASeller";
        }

        if(!buyerHasRecievedItem){
            return "buyerHasNotRecievedItem";
        }
        
        return "finished";
        
    }

    
    function setBuyer() payable public {
        // Ensure buyer has not been set
        // https://ethereum.stackexchange.com/questions/6756/ways-to-see-if-address-is-empty/6762
        require(buyer == address(0), "buyer address has not been set"); //makes ure the address is empty

        buyer = payable(msg.sender);// set buyer to be sender

        require(msg.value == price * 3, "the deposited value must equal to x * 3"); //make sure the value is price by 3

        require(!buyerHasDeposited, "Buyer has not yet deposited"); //make sure the buyer has not deposited yet

        buyerHasDeposited = true; //  if thats the case 
        emit Deposit(getCurrentState());

    }

    function setSeller() payable public {
        // Ensure the seller has not been set
        require(seller == address(0), "seller address has not been set");

        // if the seller has not been set and the state still needs addresses, set the seller to the msg.sender
        seller = payable(msg.sender);
        
        require(msg.value == price * 2, "the deposited value must equal to x * 2");

        require(!sellerHasDeposited, "Seller has not yet deposited");

        sellerHasDeposited = true;// if all that is true set sellerHasDeposited to true
        emit Deposit(getCurrentState());

    }
    
    
    function buyerRecieveItem() public {
        require(getCurrentState() == ContractState.buyerHasNotRecievedItem, "Buyer should be waiting for item");
        require(msg.sender == buyer, "Only the Buyer can state when they have recieved product");
        buyer.transfer(price * 2);
        seller.transfer(price * 3);
        buyerHasRecievedItem = true;
        emit Deposit(getCurrentState());
   }
   
   function contractExpired() public{
       
   }

}