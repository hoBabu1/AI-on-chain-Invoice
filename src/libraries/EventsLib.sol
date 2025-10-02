// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library EventsLib {
    event InvoiceNft__TokenRegisteredSuccessFully(address indexed token);
    event InvoiceNft__PaymentSuccessfUll(
        uint256 indexed amount,
        address indexed payee,
        uint256 indexed timestamp
    );
    event InvoiceNft__UserRegistered(
        address indexed user,
        string indexed website
    );
}
