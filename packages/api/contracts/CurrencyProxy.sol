// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;

import "./Currency.sol";
import "./IERC721Receiver.sol";

/** @title ERC20 Proxy contract.
 * @dev Manages ERC20 assets using the chain owner as a signing oracle for validation and cross-chain transfer
 */
contract CurrencyProxy {
    address internal signer; // signer oracle address
    uint256 internal chainId; // unique chain id
    Currency internal parent; // managed ERC20 contract
    uint256 internal deposits; // amount deposited in this contract
    mapping(bytes32 => bool) internal usedWithdrawHashes; // deposit hashes that have been used up (replay protection)

    bytes internal prefix = "\x19Ethereum Signed Message:\n32"; // Signed message prefix

    /**
     * @dev Construct the proxy with a managed parent and chain ID
     * @param parentAddress Address of the managed ERC20 contract
     * @param signerAddress Address of an authorized signer
     * @param _chainId Chain ID this contract is attached to
     * Default parent address: 0xd7523103ba15c1dfcf0f5ea1c553bc18179ac656
     * Default signer address: 0xfa80e7480e9c42a9241e16d6c1e7518c1b1757e4
     */
    constructor(
        address parentAddress,
        address signerAddress,
        uint256 _chainId
    ) {
        signer = signerAddress;
        chainId = _chainId;
        parent = Currency(parentAddress);
    }

    /** @dev Log the fact that we withdrew oracle-signed fungible assets
     * @param from Address withdrawn from
     * @param amount Amount to withdraw
     * @param timestamp Time of the transaction withdrawl
     */
    event Withdrew(
        address indexed from,
        uint256 indexed amount,
        uint256 indexed timestamp
    );

    /** @dev Used by the oracle when signing
     * @param from Address deposited from
     * @param amount Amount to deposit
     */
    event Deposited(address indexed from, uint256 indexed amount);

    /** @dev Set the address for the signer oracle
     * @param newSigner Address of the new signer
     */
    function setSigner(address newSigner) public {
        require(
            msg.sender == signer,
            "new signer can only be set by old signer"
        );
        signer = newSigner;
    }

    /** @dev Set the parent contract that this proxy manages
     * @param newParent Address of parent contract
     */
    function setCoinParent(address newParent) public {
        require(msg.sender == signer, "must be signer");
        parent = Currency(newParent);
    }

    /** @dev Withdraw ERC20 assets to an address
     * @param to Address to withdraw to
     * Example is 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param amount Amount to withdraw
     * @param timestamp Timestamp of the transaction
     * @param r ECDSA output
     * Example is 0xc336b0bb5cac4584d79e77b1680ab789171ebc95f44f68bb1cc0a7b1174058ad
     * @param s ECDSA output
     * Example is 0x72b888e952c0c39a8054f2b6dc41df645f5d4dc3d9cc6118535d88aa34945440
     * @param v Recovery ID
     * Example is 0x1c
     * Example args: 0x08E242bB06D85073e69222aF8273af419d19E4f6, 1, 10, 0xc336b0bb5cac4584d79e77b1680ab789171ebc95f44f68bb1cc0a7b1174058ad, 0x72b888e952c0c39a8054f2b6dc41df645f5d4dc3d9cc6118535d88aa34945440, 0x1c
     */
    function withdraw(
        address to,
        uint256 amount,
        uint256 timestamp,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public {
        bytes memory message = abi.encodePacked(to, amount, timestamp, chainId); // Encode message
        bytes32 messageHash = keccak256(message); // Hash the message
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, messageHash)); // Add the signed preview and hash that
        require(
            ecrecover(prefixedHash, v, r, s) == signer,
            "invalid signature"
        ); // Recover address from sig check if it's the signer
        require(!usedWithdrawHashes[prefixedHash], "hash already used"); // Check if this transaction has been used (to prevent replay attacks)
        usedWithdrawHashes[prefixedHash] = true; // Mark the transaction hash as used, so it can't be used again

        bool needsMint = deposits < amount; // Check if we have enough asset, or if we need to mint more
        uint256 balanceNeeded = SafeMath.sub(amount, deposits); // Calculate how much we need
        if (needsMint) {
            deposits = SafeMath.add(deposits, balanceNeeded); // If we need to mint more, add the balance
        }
        deposits = SafeMath.sub(deposits, amount); // Set remaining deposits

        emit Withdrew(to, amount, timestamp); // Emit Withdraw event

        if (needsMint) {
            parent.mint(address(this), balanceNeeded); // If we need to mint more, mint it
        }

        require(parent.transfer(to, amount), "transfer failed"); // Attempt the transfer, back out if it fails
    }

    /** @dev Deposit ERC20 assets to an address
     * @param to Address to deposit to
     * Example is 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param amount Amount to withdraw
     */
    function deposit(address to, uint256 amount) public {
        deposits = SafeMath.add(deposits, amount); // add the amount to deposits

        emit Deposited(to, amount); // emit Deposited event

        require(
            parent.transferFrom(msg.sender, address(this), amount),
            "transfer failed"
        ); // Attempt transfer and back out if it fails
    }

    /** @dev Check if the nonce has been used
     * @param to Address to deposit to
     * Example is 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param amount Amount to withdraw
     * @param timestamp Timestamp of the transaction
     * @return true if the nonce has been used
     */
    function withdrawNonceUsed(
        address to,
        uint256 amount,
        uint256 timestamp
    ) public view returns (bool) {
        bytes memory message = abi.encodePacked(to, amount, timestamp, chainId);
        bytes32 messageHash = keccak256(message);
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, messageHash));
        return usedWithdrawHashes[prefixedHash]; // return true if it exists
    }
}
