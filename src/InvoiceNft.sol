// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract InvoiceNft is ERC721, Ownable {
    struct UserInfo {
        address user;
        string protfolioWebsite;
    }

    struct PaymentInfo {
        uint256 amount;
        bool paid;
        address payee;
    }
    // ================================================================
    // │                   Eevnts                                     │
    // ================================================================
    event UserRegistered(address indexed user, string indexed website);

    // ================================================================
    // │                   Error                                   │
    // ================================================================
    error BasicNft__TokenUriNotFound();
    error InvoiceNft__UserIsNotRegistered();

    mapping(uint256 tokenId => string tokenUri) private s_tokenIdToUri;
    mapping(address user => UserInfo userData) private s_userInformation;
    mapping(address user => mapping(uint256 tokenId => PaymentInfo))
        private s_paymentStatus;
    uint256 private s_tokenCounter;

    // ================================================================
    // │                   Modifier                                   │
    // ================================================================

    modifier onlyRegisteredUser() {
        if (s_userInformation[msg.sender].user == address(0)) {
            revert InvoiceNft__UserIsNotRegistered();
        }
        _;
    }

    // ================================================================
    // │                   Constructor                                │
    // ================================================================
    constructor(address _owner) ERC721("Invoice", "Invoice") Ownable(_owner) {
        s_tokenCounter = 0;
    }

    // ================================================================
    // │                   Public Function                             │
    // ================================================================

    function registerUser(string calldata _protfolioWebsite) external {
        s_userInformation[msg.sender] = UserInfo({
            user: msg.sender,
            protfolioWebsite: _protfolioWebsite
        });
        emit UserRegistered(msg.sender, _protfolioWebsite);
    }

    function mintNft(
        string memory tokenUri,
        uint256 _amount
    ) public onlyRegisteredUser {
        s_tokenIdToUri[s_tokenCounter] = tokenUri;
        _safeMint(msg.sender, s_tokenCounter);
        s_paymentStatus[msg.sender][s_tokenCounter] = PaymentInfo({
            amount: _amount,
            paid: false,
            payee: address(0)
        });
        s_tokenCounter = s_tokenCounter + 1;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (ownerOf(tokenId) == address(0)) {
            revert BasicNft__TokenUriNotFound();
        }
        return s_tokenIdToUri[tokenId];
    }

    // ================================================================
    // │                  Getter Function                             │
    // ================================================================

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getPaymentInfo(
        address _user,
        uint256 _tokenId
    ) returns (PaymentInfo memory) {
        return s_paymentStatus[_user][_tokenId];
    }

    function getUserInfo(
        address _user
    ) external view returns (UserInfo memory) {
        return s_userInformation[_user];
    }
}
