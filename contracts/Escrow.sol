//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    /**
     * Important mapping to show listed AgroProducts, purchasePrices,
     * the amount in Escrow and the address of the buyers
     */
    mapping (uint256 => bool) public isListed;
    mapping (uint256 => uint256) public purchasePrice;
    mapping (uint256 => uint256) public escrowAmount;
    mapping (uint256 => address) public buyer;
    mapping (uint => bool) public reviewPassed;
    mapping (uint256 => mapping (address => bool)) public approvalStatus;

    event SaleFinalized(
        uint256 indexed nftID,
        address buyer,
        address seller,
        address lender,
        address reviewedBy,
        bool    sold
    );

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    // List an agro product
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice, 
        uint256 _escrowAmount 
    ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }


    // deposit investment to contract. only buyer
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID){
        require(msg.value >= escrowAmount[_nftID]);
    }

    // updating the status of the business
    function updateReviewStatus(uint256 _nftID, bool _passed) public onlyInspector {
        reviewPassed[_nftID] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        approvalStatus[_nftID][msg.sender] = true;
    }

    // Finalize the sale
    // Require the review of the business
    // require sale to be authorized
    // require funds to be correct amount
    // Transfer NFT to buyer and transfer funds to seller
    function finalizeSale(uint256 _nftID) public {
        require(reviewPassed[_nftID]);
        require(approvalStatus[_nftID][buyer[_nftID]]);
        require(approvalStatus[_nftID][seller]);
        require(approvalStatus[_nftID][lender]);
        isListed[_nftID] = false;

        // ensure that funds locked in contract suffices
        require(address(this).balance >= purchasePrice[_nftID]);
        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success, "failed");
        emit SaleFinalized(
            _nftID,
            msg.sender,
            seller,
            lender,
            inspector,
            success
        );
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);

    }

    // cancel if review is not approved
    function cancelSale(uint256 _nftID) public {
        if (reviewPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    // the recieve function since we will be storing ETH on the smartcontract
    receive() external payable {}

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }
}
