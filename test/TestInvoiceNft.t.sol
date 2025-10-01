//SPDX-License-Identifier:MIT

pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {InvoiceNft} from "../src/InvoiceNft.sol";
import {MockUsdt} from "./mock/MockUsdt.sol";

contract TestInvoiceNft is Test {
    InvoiceNft invoiceNft;
    MockUsdt mUsdt;
    address owner = makeAddr("Owner");
    address user = makeAddr("newUser");
    address payee = makeAddr("payee");
    string tokenUri =
        "https://gateway.pinata.cloud/ipfs/bafkreigdeun7vvw5vusx6tlgxbvpeq5v27pxbl4jd7w6ybjly4lof3bvsq";

    function setUp() external {
        vm.startPrank(owner);
        mUsdt = new MockUsdt();
        invoiceNft = new InvoiceNft(owner);
        vm.stopPrank();
    }

    function testFlow() public {
        // Register User

        vm.startPrank(user);
        string memory userProtfolio = "ILoveYou";
        invoiceNft.registerUser(userProtfolio);

        address registeredAddress = invoiceNft.getUserInfo(user).user;
        assertEq(registeredAddress, user);

        // create invoice

        invoiceNft.mintNft(tokenUri, 15e18);
        InvoiceNft.PaymentInfo memory registeredData = invoiceNft
            .getPaymentInfo(user, 0);
        assertEq(15e18, registeredData.amount);
        assertEq(false, registeredData.paid);
        assertEq(user, registeredData.recipient);
        assertEq(address(0), registeredData.payee);

        address ownerOfTokenId = invoiceNft.ownerOf(0);
        assertEq(user, ownerOfTokenId);

        vm.stopPrank();

        // enable token

        vm.startPrank(owner);
        bool status;
        status = invoiceNft.checkTokenEnabledOrNot(address(mUsdt));
        assertEq(status, false);
        invoiceNft.enableToken(address(mUsdt));
        status = invoiceNft.checkTokenEnabledOrNot(address(mUsdt));
        assertEq(status, true);
        
        // giving token to payee
        vm.startPrank(owner);
        mUsdt.transfer(payee,15e18);
        vm.stopPrank();

        assertEq(mUsdt.balanceOf(payee), 15e18);
        assertEq(mUsdt.balanceOf(user),0);

        // payment of invoice
        vm.startPrank(payee);
        mUsdt.approve(address(invoiceNft), 15e18);
        invoiceNft.paymentOfInvoice(user,address(mUsdt),0,15e18);
        vm.stopPrank();

        assertEq(mUsdt.balanceOf(payee), 0);
        assertEq(mUsdt.balanceOf(user),15e18);

        InvoiceNft.PaymentInfo memory updateddata = invoiceNft
            .getPaymentInfo(user, 0);

        assertEq(updateddata.paid, true);
        assertEq(updateddata.payee, payee);

    }
}
