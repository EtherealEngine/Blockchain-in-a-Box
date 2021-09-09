// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./ERC20Capped.sol";
import "./SafeMath.sol";

/** @title Extension of {ERC20} that adds a cap to the supply of assets. */
contract Currency is ERC20Capped {
    mapping(address => bool) internal allowedMinters; // whether anyone can mint assets (should be sidechain only)
    uint256 internal numAllowedMinters;

    /**
     * @dev Create a new fungible asset
     * @param name Name of the asset (default is Currency)
     * @param symbol Asset identifier (default is Currency)
     * @param cap Sets the asset market cap. This value is immutable, it can only be
     * set once during construction.
     * Default cap: 2147483648000000000000000000 or (2**31) + '000000000000000000'
     */
    constructor(string memory name,string memory symbol,uint256 cap) 
        ERC20(name, symbol) ERC20Capped(cap) {
            allowedMinters[msg.sender] = true;
            numAllowedMinters = 1;
    }

    /**
     * @dev Test if an address is allowed to mint ERC20 assets
     * @param a address to test
     * @return true if address is allowed to mint
     */
    function isAllowedMinter(address a) public view returns (bool) {
        return allowedMinters[a];
    }

    /** @dev Modify functions to ensure only allowed minters can mint */
    
    modifier onlyMinter() {
        require(isAllowedMinter(msg.sender), "sender is not a minter");
        _; // Inject modified function
    }
    
    /**
     * @dev Mint ERC20 assets
     * @param account Assets created for this account
     * @param amount Number of assets to mint
     */
    function mint(address account, uint256 amount) public onlyMinter() {
        _mint(account, amount);
    }

    /**
     * @dev Add an account to the list of accounts allowed to create ERC20 assets
     * @param a address to whitelist
     */
    function addAllowedMinter(address a) public onlyMinter() {
        require(!isAllowedMinter(a), "target is already a minter");
        allowedMinters[a] = true;
        numAllowedMinters = SafeMath.add(numAllowedMinters, 1);
    }

    /**
     * @dev Remove an account from the list of accounts allowed to create ERC20 assets
     * @param a address to remove from whitelist
     */
    function removeAllowedMinter(address a) public onlyMinter() {
        require(isAllowedMinter(a), "target is not a minter");
        require(numAllowedMinters > 1, "cannot remove the only minter");
        allowedMinters[a] = false;
        numAllowedMinters = SafeMath.sub(numAllowedMinters, 1);
    }
}
