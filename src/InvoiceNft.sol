// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract InvoiceNft is ERC721, Ownable {
    using SafeERC20 for IERC20;

    struct UserInfo {
        address user;
        string protfolioWebsite;
    }

    struct PaymentInfo {
        address recipient;
        address payee;
        uint256 amount;
        bool paid;
    }
    // ================================================================
    // │                   Eevnts                                     │
    // ================================================================
    event InvoiceNft__UserRegistered(
        address indexed user,
        string indexed website
    );
    event InvoiceNft__TokenRegisteredSuccessFully(address indexed token);
    event InvoiceNft__PaymentSuccessfUll(
        uint256 indexed amount,
        address indexed payee,
        uint256 indexed timestamp
    );

    // ================================================================
    // │                   Error                                   │
    // ================================================================
    error BasicNft__TokenUriNotFound();
    error InvoiceNft__UserIsNotRegistered();
    error InvoiceNft__TokenAlreadyEnabled();
    error InvoiceNft__AddressZeroFound();
    error InvoiceNft__TokenNotEnabled();
    error InvoiceNft__AlreadyPaid();
    error InvoiceNft__AmountIsIncorrect();
    error InvoiceNft__WrongInvoiceNumber();

    mapping(uint256 tokenId => string tokenUri) private s_tokenIdToUri;
    mapping(address user => UserInfo userData) private s_userInformation;
    mapping(address user => mapping(uint256 tokenId => PaymentInfo))
        private s_paymentStatus;
    mapping(address token => bool enabled) s_isTokenEnabled;
    uint256 private s_tokenCounter;

    // ================================================================
    // │                   Modifier                                   │
    // ================================================================

    modifier onlyRegisteredUser(address _recipient) {
        if (s_userInformation[_recipient].user == address(0)) {
            revert InvoiceNft__UserIsNotRegistered();
        }
        _;
    }

    modifier checkPyamentParameter(
        address _recipient,
        uint256 _invoiceNumber,
        address _token
    ) {
        if (!s_isTokenEnabled[_token]) {
            revert InvoiceNft__TokenNotEnabled();
        }

        address ownerOfTokenId = ownerOf(_invoiceNumber);
        if (ownerOfTokenId != _recipient) {
            revert InvoiceNft__WrongInvoiceNumber();
        }

        if (s_paymentStatus[_recipient][_invoiceNumber].paid) {
            revert InvoiceNft__AlreadyPaid();
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

    function paymentOfInvoice(
        address _recipient,
        address _token,
        uint256 _invoiceNumber,
        uint256 _amount
    ) public onlyRegisteredUser(_recipient) {
        PaymentInfo storage paymentInfo = s_paymentStatus[_recipient][
            _invoiceNumber
        ];
        if (_amount != paymentInfo.amount) {
            revert InvoiceNft__AmountIsIncorrect();
        }

        IERC20(_token).safeTransferFrom(
            msg.sender,
            paymentInfo.recipient,
            _amount
        );

        paymentInfo.paid = true;
        paymentInfo.payee = msg.sender;
        emit InvoiceNft__PaymentSuccessfUll(
            _amount,
            msg.sender,
            block.timestamp
        );
    }

    function registerUser(string calldata _protfolioWebsite) external {
        s_userInformation[msg.sender] = UserInfo({
            user: msg.sender,
            protfolioWebsite: _protfolioWebsite
        });
        emit InvoiceNft__UserRegistered(msg.sender, _protfolioWebsite);
    }

    function mintNft(
        string memory tokenUri,
        uint256 _amount
    ) public onlyRegisteredUser(msg.sender) {
        s_tokenIdToUri[s_tokenCounter] = tokenUri;
        _safeMint(msg.sender, s_tokenCounter);
        s_paymentStatus[msg.sender][s_tokenCounter] = PaymentInfo({
            recipient: msg.sender,
            payee: address(0),
            amount: _amount,
            paid: false
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

    function enableToken(address _token) external onlyOwner {
        if (_token == address(0)) {
            revert InvoiceNft__AddressZeroFound();
        }
        if (s_isTokenEnabled[_token] == true) {
            revert InvoiceNft__TokenAlreadyEnabled();
        }

        s_isTokenEnabled[_token] = true;
        emit InvoiceNft__TokenRegisteredSuccessFully(_token);
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
    ) external view returns (PaymentInfo memory) {
        return s_paymentStatus[_user][_tokenId];
    }

    function getUserInfo(
        address _user
    ) external view returns (UserInfo memory) {
        return s_userInformation[_user];
    }

    function checkTokenEnabledOrNot(
        address _token
    ) external view returns (bool) {
        return s_isTokenEnabled[_token];
    }
}
