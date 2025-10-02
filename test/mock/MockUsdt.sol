// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MockUsdt is ERC20  {
    constructor() ERC20("Mock USDT", "mUSDT") {
        _mint(msg.sender, 15000 * 10 ** decimals());
    }
}