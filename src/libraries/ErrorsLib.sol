// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library ErrorsLib {
    error InvoiceNft__TokenUriNotFound();
    error InvoiceNft__UserIsNotRegistered();
    error InvoiceNft__TokenAlreadyEnabled();
    error InvoiceNft__AddressZeroFound();
    error InvoiceNft__TokenNotEnabled();
    error InvoiceNft__AlreadyPaid();
    error InvoiceNft__AmountIsIncorrect();
    error InvoiceNft__WrongInvoiceNumber();
    error InvoiceNft__UserIsAlreadyRegistered();
}
