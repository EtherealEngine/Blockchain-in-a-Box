// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;

import "./Inventory.sol";

/** @title ERC721 Proxy contract.
 * @dev Manages ERC721 assets using the chain owner as a signing oracle for validation and cross-chain transfer
 */
/* is IERC721Receiver */
contract InventoryProxy {
    address internal signer; // signer oracle address
    uint256 internal chainId; // unique chain id
    Inventory internal parent; // managed ERC721 contract
    mapping(uint256 => bool) internal deposits; // whether the asset has been deposited in this contract
    mapping(bytes32 => bool) internal usedWithdrawHashes; // deposit hashes that have been used up (replay protection)

    bytes internal prefix = "\x19Ethereum Signed Message:\n32";

    event Withdrew(
        address indexed from,
        uint256 indexed assetId,
        uint256 indexed timestamp
    ); // logs the fact that we withdrew an oracle-signed asset
    event Deposited(address indexed to, uint256 indexed assetId); // used by the oracle when signing

    /**
     * @dev Construct the proxy with a managed parent and chain ID
     * @param parentAddress Address of the managed ERC721 contract
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
        parent = Inventory(parentAddress);
    }

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
    function setAssetParent(address newParent) public {
        require(msg.sender == signer, "must be signer");
        parent = Inventory(newParent);
    }

    /** @dev Withdraw an ERC721 asset to an address
     * @param to Address to withdraw to
     * Example is 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param assetId Asset ID to withdraw
     * @param timestamp Timestamp of the transaction
     * @param r ECDSA output
     * Example is 0xc336b0bb5cac4584d79e77b1680ab789171ebc95f44f68bb1cc0a7b1174058ad
     * @param s ECDSA output
     * Example is 0x72b888e952c0c39a8054f2b6dc41df645f5d4dc3d9cc6118535d88aa34945440
     * @param v Recovery ID
     * Example is 0x1c
     */
    function withdraw(
        address to,
        uint256 assetId,
        uint256 timestamp,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public {
        bytes32 prefixedHash =
            keccak256(
                abi.encodePacked(
                    prefix,
                    keccak256(abi.encodePacked(to, assetId, timestamp, chainId))
                )
            );
        address contractAddress = address(this);
        require(
            ecrecover(prefixedHash, v, r, s) == signer,
            "invalid signature"
        );
        require(!usedWithdrawHashes[prefixedHash], "hash already used");
        usedWithdrawHashes[prefixedHash] = true;

        bool oldDeposits = deposits[assetId];

        deposits[assetId] = false;

        emit Withdrew(to, assetId, timestamp);

        if (!oldDeposits) {
            parent.mintAssetId(contractAddress, assetId);
        }

        parent.transferFrom(contractAddress, to, assetId);
    }

    /** @dev Deposit an ERC721 asset to an address
     * @param to Address to deposit to
     * Example is 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param assetId Asset ID to withdraw
     */
    function deposit(address to, uint256 assetId) public {
        deposits[assetId] = true;

        emit Deposited(to, assetId);

        address from = msg.sender;
        address contractAddress = address(this);
        parent.transferFrom(from, contractAddress, assetId);
    }

    /** @dev Check if this nonce has already been used on a withdraw (to prevent replay attack)
     * @param to Address to deposit to
     * Example is 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param assetId Asset ID to withdraw
     * @param timestamp Timestamp of the transaction
     * @return Returns true if the nonce has already been used to sign a transaction
     */
    function withdrawNonceUsed(
        address to,
        uint256 assetId,
        uint256 timestamp
    ) public view returns (bool) {
        bytes32 prefixedHash =
            keccak256(
                abi.encodePacked(
                    prefix,
                    keccak256(abi.encodePacked(to, assetId, timestamp, chainId))
                )
            );
        return usedWithdrawHashes[prefixedHash];
    }
}
