const ethEnabled = async () => {
    if (window.ethereum) {   
        await window.ethereum.send('eth_requestAccounts');   
        window.web3 = new Web3(window.ethereum);   
        return true;}
        
        return false;}  

const loadEthereum = async () => {
    const isEnabled = await ethEnabled();
    if (!isEnabled) {
        console.error("Please install or enable MetaMask")
        return confirm
        ('You need metaMask installed or enabled to interact with this website, follow the link at the bottom of the page to get set up')
      
    }
}

const submitBlogPost = async (event) => {
    event.preventDefault();
    console.log('test array');
}

console.log("I'm being loaded")
window.addEventListener("load", loadEthereum)
