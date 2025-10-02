//SPDX-License-Identifier:MIT

pragma solidity 0.8.20;

import {Test,console} from "forge-std/Test.sol";
import {InvoiceNft} from "../src/InvoiceNft.sol";
import {MockUsdt} from "./mock/MockUsdt.sol";

contract TestInvoiceNft is Test {

    uint256 polygonFork;
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
         polygonFork = vm.createSelectFork("https://polygon-amoy.g.alchemy.com/v2/NdlLYVLk3FDOJ0Mz24GETvX4zjVejuHb");
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

    function test_PolygonAmoy() public {
        vm.selectFork(polygonFork);
        InvoiceNft.UserInfo memory check =
        InvoiceNft(0xc45d948467Dd39278a456D4341C00C14F31300b2).getUserInfo(0x096DD3EBFab85c85309477DDf3A18FC31ecBa33a);
        console.log(check.user);
        console.log(InvoiceNft(0xc45d948467Dd39278a456D4341C00C14F31300b2).getPaymentInfo(0x096DD3EBFab85c85309477DDf3A18FC31ecBa33a,0).paid);
    }
}
