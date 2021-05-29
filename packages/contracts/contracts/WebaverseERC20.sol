// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./ERC20Capped.sol";

/** @title Extension of {ERC20} that adds a cap to the supply of tokens. */
contract WebaverseERC20 is ERC20Capped {
    mapping(address => bool) internal allowedMinters; // whether anyone can mint tokens (should be sidechain only)
    uint256 internal numAllowedMinters;

    /**
     * @dev Create a new fungible token
     * @param name Name of the token (default is FT)
     * @param symbol Token identifier (default is SILK)
     * @param cap Sets the token market cap. This value is immutable, it can only be
     * set once during construction.
     * Default cap: 2147483648000000000000000000 or (2**31) + '000000000000000000'
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 cap
    ) public ERC20(name, symbol) ERC20Capped(cap) {
        allowedMinters[msg.sender] = true;
        numAllowedMinters = 1;
    }

    /**
     * @dev Test if an address is allowed to mint ERC20 tokens
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
     * @dev Mint ERC20 tokens
     * @param account Tokens created for this account
     * @param amount Number of tokens to mint
     */
    function mint(address account, uint256 amount) public onlyMinter() {
        _mint(account, amount);
    }

    /**
     * @dev Add an account to the list of accounts allowed to create ERC20 tokens
     * @param a address to whitelist
     */
    function addAllowedMinter(address a) public onlyMinter() {
        require(!isAllowedMinter(a), "target is already a minter");
        allowedMinters[a] = true;
        numAllowedMinters = SafeMath.add(numAllowedMinters, 1);
    }

    /**
     * @dev Remove an account from the list of accounts allowed to create ERC20 tokens
     * @param a address to remove from whitelist
     */
    function removeAllowedMinter(address a) public onlyMinter() {
        require(isAllowedMinter(a), "target is not a minter");
        require(numAllowedMinters > 1, "cannot remove the only minter");
        allowedMinters[a] = false;
        numAllowedMinters = SafeMath.sub(numAllowedMinters, 1);
    }
}
