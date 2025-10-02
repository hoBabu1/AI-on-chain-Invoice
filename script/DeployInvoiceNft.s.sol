//SPDX-License-Identifier:MIT

pragma solidity 0.8.20;

import {console,Script} from "forge-std/Script.sol";
import {InvoiceNft} from "../src/InvoiceNft.sol";
import {MockUsdt} from "../test/mock/MockUsdt.sol";
contract DeployInvoiceNft is Script {
    InvoiceNft invoiceNft;
    MockUsdt mUsdt;
    address owner = 0x096DD3EBFab85c85309477DDf3A18FC31ecBa33a;

    function run() external {
        vm.startBroadcast();
        // deploy nft 
        invoiceNft = new InvoiceNft(owner);

        // deploy token 
        mUsdt = new MockUsdt();

        // enable token 
        invoiceNft.enableToken(address(mUsdt));

        console.log("address of nft",address(invoiceNft));
        console.log("address of USDT",address(mUsdt));

        vm.stopBroadcast();
    }
}
