// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./ERC721.sol";
import "./EnumerableSet.sol";
import "./Math.sol";
import "./WebaverseERC20.sol";

/**
 * @title Extension of {ERC721} for Webaverse non-fungible tokens
 * @dev NFTs can be packed with fungible tokens, and can have special features
 * I.E. collaborators and separate creatorship and ownership
 */
contract WebaverseERC721 is ERC721 {
    using EnumerableSet for EnumerableSet.UintSet;

    WebaverseERC20 internal erc20Contract; // ERC20 contract for fungible tokens
    uint256 internal mintFee; // ERC20 fee to mint ERC721
    address internal treasuryAddress; // address into which we deposit minting fees
    bool internal isSingleIssue; // whether the token is single issue (name based) or no (hash based)
    bool internal isPublicallyMintable; // whether anyone can mint tokens in this copy of the contract
    mapping(address => bool) internal allowedMinters; // addresses allowed to mint in this copy of the contract
    uint256 internal nextTokenId = 0; // the next token id to use (increases linearly)
    mapping(uint256 => string) internal tokenIdToHash; // map of token id to hash it represents
    mapping(string => uint256) internal hashToStartTokenId; // map of hashes to start of token ids for it
    mapping(string => uint256) internal hashToTotalSupply; // map of hash to total number of tokens for it
    mapping(string => Metadata[]) internal hashToMetadata; // map of hash to metadata key-value store
    mapping(string => address[]) internal hashToCollaborators; // map of hash to addresses that can change metadata
    mapping(uint256 => uint256) internal tokenIdToBalance; // map of tokens to packed balance
    mapping(uint256 => address) internal minters; // map of tokens to minters
    mapping(uint256 => Metadata[]) internal tokenIdToMetadata; // map of token id to metadata key-value store
    mapping(uint256 => address[]) internal tokenIdToCollaborators; // map of token id to addresses that can change metadata

    struct Metadata {
        string key;
        string value;
    }

    struct Token {
        uint256 id;
        string hash;
        string name;
        string ext;
        address minter;
        address owner;
        uint256 balance;
        uint256 totalSupply;
    }

    event MetadataSet(string hash, string key, string value);
    event SingleMetadataSet(uint256 tokenId, string key, string value);
    event HashUpdate(string oldHash, string newHash);
    event CollaboratorAdded(string hash, address a);
    event CollaboratorRemoved(string hash, address a);
    event SingleCollaboratorAdded(uint256 tokenId, address a);
    event SingleCollaboratorRemoved(uint256 tokenId, address a);

    /**
     * @dev Create this ERC721 contract
     * @param name Name of the contract (default is "NFT")
     * @param symbol Symbol for the token (default is ???)
     * @param baseUri Base URI (example is http://)
     * @param _erc20Contract ERC20 contract attached to fungible tokens
     * @param _treasuryAddress Address of the treasury account
     * @param _isSingleIssue Whether the token is single issue (name based) or no (hash based)
     * @param _isPublicallyMintable Whether anyone can mint tokens with this contract
     * I.E. collaborators and separate creatorship and ownership
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri,
        WebaverseERC20 _erc20Contract,
        uint256 _mintFee,
        address _treasuryAddress,
        bool _isSingleIssue,
        bool _isPublicallyMintable
    ) public ERC721(name, symbol) {
        _setBaseURI(baseUri);
        erc20Contract = _erc20Contract;
        mintFee = _mintFee;
        treasuryAddress = _treasuryAddress;
        isSingleIssue = _isSingleIssue;
        isPublicallyMintable = _isPublicallyMintable;
        allowedMinters[msg.sender] = true;
    }

    /**
     * @dev Set the price to mint
     * @param _mintFee Minting fee, default is 10 FT
     */
    function setMintFee(uint256 _mintFee) public {
        require(
            msg.sender == treasuryAddress,
            "must be set from treasury address"
        );
        mintFee = _mintFee;
    }

    /**
     * @dev Set the treasury address
     * @param _treasuryAddress Account address of the treasurer
     */
    function setTreasuryAddress(address _treasuryAddress) public {
        require(
            msg.sender == treasuryAddress,
            "must be set from treasury address"
        );
        treasuryAddress = _treasuryAddress;
    }

    /**
     * @dev Get the balance of fungible tokens packed into this non-fungible token
     * @param tokenId ID of the non-fungible ERC721 token
     */
    function getPackedBalance(uint256 tokenId) public view returns (uint256) {
        return tokenIdToBalance[tokenId];
    }

    /**
     * @dev Pack fungible tokens into this non-fungible token
     * @param from Address of who is packing the token
     * @param tokenId ID of the token
     * @param amount Amount to pack
     */
    function pack(
        address from,
        uint256 tokenId,
        uint256 amount
    ) public {
        require(_exists(tokenId), "token id does not exist");

        tokenIdToBalance[tokenId] = SafeMath.add(
            tokenIdToBalance[tokenId],
            amount
        );

        require(
            erc20Contract.transferFrom(from, address(this), amount),
            "transfer failed"
        );
    }

    /**
     * @dev Unpack fungible tokens from this non-fungible token
     * @param to Address of who is packing the token
     * @param tokenId ID of the token
     * @param amount Amount to unpack
     */
    function unpack(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public {
        require(ownerOf(tokenId) == msg.sender, "not your token");
        require(tokenIdToBalance[tokenId] >= amount, "insufficient balance");

        tokenIdToBalance[tokenId] = SafeMath.sub(
            tokenIdToBalance[tokenId],
            amount
        );

        require(erc20Contract.transfer(to, amount), "transfer failed");
    }

    /**
     * @dev Mint one or more non-fungible tokens with this contract
     * The count parameter is what is looped over to create the token.
     * This means the hiegher the count, the higher the gas.
     * This is the main reason that we can only mint so many tokens at once.
     * @param to Address of who is receiving the token on mint
     * Example: 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param hash Hash of the file to mint
     * Example: 0x1
     * @param name Name of the token
     * @param ext File extension of the token
     * Example: "png"
     * @param description Description of the token (set by user)
     * @param count Number of tokens to mint (ie: 1)
     */
    function mint(
        address to,
        string memory hash,
        string memory name,
        string memory ext,
        string memory description,
        uint256 count
    ) public {
        require(!isSingleIssue, "wrong mint method called"); // Single issue tokens should use mintSingle
        require(
            isPublicallyMintable || isAllowedMinter(msg.sender),
            "not allowed to mint"
        ); // Only allowed minters can mint
        require(bytes(hash).length > 0, "hash cannot be empty"); // Hash cannot be empty (minting null items)
        require(count > 0, "count must be greater than zero"); // Count must be 1 or more (cannot mint no items)
        require(hashToTotalSupply[hash] == 0, "hash already exists"); // Prevent multiple mints of the same file (all files minted must be unique)

        hashToStartTokenId[hash] = nextTokenId + 1; // Increment token ID by one

        uint256 i = 0;
        while (i < count) {
            // Each token gets a new token ID, even if minted in a set
            nextTokenId = SafeMath.add(nextTokenId, 1);
            uint256 tokenId = nextTokenId;

            _mint(to, tokenId);
            minters[tokenId] = to;

            tokenIdToHash[tokenId] = hash;
            i++;
        }
        hashToTotalSupply[hash] = count;
        hashToMetadata[hash].push(Metadata("name", name));
        hashToMetadata[hash].push(Metadata("ext", ext));
        hashToMetadata[hash].push(Metadata("description", description));
        hashToCollaborators[hash].push(to);

        // Unless the mint free, transfer fungible tokens and attempt to pay the fee
        if (mintFee != 0) {
            require(
                erc20Contract.transferFrom(
                    msg.sender,
                    treasuryAddress,
                    mintFee
                ),
                "mint transfer failed"
            );
        }
    }

    /**
     * @dev Mint one non-fungible tokens with this contract
     * @param to Address of who is receiving the token on mint
     * Example: 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param hash Hash of the file to mint
     */
    function mintSingle(address to, string memory hash) public {
        require(isSingleIssue, "wrong mint method called");
        require(
            isPublicallyMintable || isAllowedMinter(msg.sender),
            "not allowed to mint"
        );
        require(hashToTotalSupply[hash] == 0, "hash already exists");

        nextTokenId = SafeMath.add(nextTokenId, 1);
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        minters[tokenId] = to;

        tokenIdToHash[tokenId] = hash;
        hashToTotalSupply[hash] = 1;
        hashToCollaborators[hash].push(to);

        if (mintFee != 0) {
            require(
                erc20Contract.transferFrom(
                    msg.sender,
                    treasuryAddress,
                    mintFee
                ),
                "mint transfer failed"
            );
        }
    }

    /**
     * @dev Get the address for for the minter of the token
     * @param tokenId ID of the token we are querying
     * @return Address of the minter
     */
    function getMinter(uint256 tokenId) public view returns (address) {
        return minters[tokenId];
    }

    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return Returns true if strings are equal
     */
    function streq(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    /**
     * @dev Mint a token with a specific ID
     * @param to Who should receive the minted token
     * @param tokenId ID of the token to mint (ie: 250)
     */
    function mintTokenId(address to, uint256 tokenId) public {
        require(isAllowedMinter(msg.sender), "minter not allowed");

        _mint(to, tokenId);
    }

    /**
     * @dev Set the base URI for this contract
     * @param baseURI_ Base URI to send to
     */
    function setBaseURI(string memory baseURI_) public {
        require(
            allowedMinters[msg.sender],
            "only minters can set the base uri"
        );
        _setBaseURI(baseURI_);
    }

    /**
     * @dev Get the URI of a token
     * @param tokenId Token to get the URI from (ie: 250)
     * @return URI of the token to retrieve
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return string(abi.encodePacked(baseURI(), uint2str(tokenId)));
    }

    /**
     * @dev Check if the token exists
     * @param tokenId Token to test
     * @return Returns true if the token exists
     */
    function tokenExists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    /**
     * @dev Check if an account is allowed to mint tokens
     * @param a Address to check
     * @return Returns true if the acount can mint
     */
    function isAllowedMinter(address a) public view returns (bool) {
        return allowedMinters[a];
    }

    /**
     * @dev Add a minter to the approved list to mint tokens
     * @param a Address to whitelist
     */
    function addAllowedMinter(address a) public {
        require(isAllowedMinter(msg.sender));
        require(!isAllowedMinter(a), "target is already a minter");
        allowedMinters[a] = true;
    }

    /**
     * @dev Remove a minter from the approved list to mint tokens
     * @param a Address to remove from whitelist
     */
    function removeAllowedMinter(address a) public {
        require(isAllowedMinter(msg.sender), "sender is not a minter");
        require(isAllowedMinter(a), "target is not a minter");
        allowedMinters[a] = false;
    }

    /**
     * @dev Check is an address has access as a collaborator (for development of a token between multiple users)
     * @param hash Hash of the token to test
     * @param a Address to query
     * @return Returns true if the address is a collaborator on this token
     */
    function isCollaborator(string memory hash, address a)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < hashToCollaborators[hash].length; i++) {
            if (hashToCollaborators[hash][i] == a) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev List collaborators for a token
     * @param hash Hash of the token to get collaborators for
     */
    function getCollaborators(string memory hash) public view returns (address[] memory) {
        address[] memory collaborators = hashToCollaborators[hash];
        return collaborators;
    }

    /**
     * @dev Add collaborator to a token
     * @param hash Hash of the token to add the collaborator to
     * @param a Address to whitelist
     */
    function addCollaborator(string memory hash, address a) public {
        require(isCollaborator(hash, msg.sender), "you are not a collaborator");
        require(!isCollaborator(hash, a), "they are already a collaborator");
        hashToCollaborators[hash].push(a);
        
        emit CollaboratorAdded(hash, a);
    }

    /**
     * @dev Remove collaborator from a token
     * @param hash Hash of the token to remove the collaborator from
     * @param a Address to remove from whitelist
     */
    function removeCollaborator(string memory hash, address a) public {
        require(isCollaborator(hash, msg.sender), "you are not a collaborator");
        require(
            isCollaborator(hash, a),
            "they are not a collaborator"
        );

        uint256 newSize = 0;
        for (uint256 i = 0; i < hashToCollaborators[hash].length; i++) {
            if (hashToCollaborators[hash][i] != a) {
                newSize++;
            }
        }

        address[] memory newCollaborators = new address[](newSize);
        uint256 index = 0;
        for (uint256 i = 0; i < hashToCollaborators[hash].length; i++) {
            address oldCollaborator = hashToCollaborators[hash][i];
            if (oldCollaborator != a) {
                newCollaborators[index++] = oldCollaborator;
            }
        }
        hashToCollaborators[hash] = newCollaborators;
        
        emit CollaboratorRemoved(hash, a);
    }

    /**
     * @dev Check if this address is a collaborator on a single issue token
     * @param tokenId ID of the token
     * @param a Address to check
     * @return Returns true if the address is a collaborator on the token
     */
    function isSingleCollaborator(uint256 tokenId, address a)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < tokenIdToCollaborators[tokenId].length; i++) {
            if (tokenIdToCollaborators[tokenId][i] == a) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev List collaborators for a token
     * @param tokenId Token ID of the token to get collaborators for
     */
    function getSingleCollaborators(uint256 tokenId) public view returns (address[] memory) {
        address[] memory collaborators = tokenIdToCollaborators[tokenId];
        return collaborators;
    }

    /**
     * @dev Add a collaborator to a single token
     * @param tokenId ID of the token
     * @param a Address to whitelist
     */
    function addSingleCollaborator(uint256 tokenId, address a) public {
        require(
            ownerOf(tokenId) == a || isSingleCollaborator(tokenId, msg.sender),
            "you are not a collaborator"
        );
        require(
            !isSingleCollaborator(tokenId, a),
            "they are already a collaborator"
        );
        tokenIdToCollaborators[tokenId].push(a);
        
        emit SingleCollaboratorAdded(tokenId, a);
    }

    /**
     * @dev Remove a collaborator from a single token
     * @param tokenId ID of the token
     * @param a Address to remove from whitelist
     */
    function removeSingleCollaborator(uint256 tokenId, address a) public {
        require(
            ownerOf(tokenId) == a || isSingleCollaborator(tokenId, msg.sender),
            "you are not a collaborator"
        );
        require(
            isSingleCollaborator(tokenId, msg.sender),
            "they are not a collaborator"
        );

        uint256 newSize = 0;
        for (uint256 i = 0; i < tokenIdToCollaborators[tokenId].length; i++) {
            if (tokenIdToCollaborators[tokenId][i] != a) {
                newSize++;
            }
        }

        address[] memory newTokenIdCollaborators = new address[](newSize);
        uint256 index = 0;
        for (uint256 i = 0; i < tokenIdToCollaborators[tokenId].length; i++) {
            address oldTokenIdCollaborator = tokenIdToCollaborators[tokenId][i];
            if (oldTokenIdCollaborator != a) {
                newTokenIdCollaborators[index++] = oldTokenIdCollaborator;
            }
        }
        tokenIdToCollaborators[tokenId] = newTokenIdCollaborators;
        
        emit SingleCollaboratorRemoved(tokenId, a);
    }

    /**
     * @dev Seal the token forever and remove collaborators so that it can't be altered
     * @param hash Hash of the collaborative token
     */
    function seal(string memory hash) public {
        require(isCollaborator(hash, msg.sender), "not a collaborator");
        delete hashToCollaborators[hash];
    }

    /**
     * @dev Get the hash of a token by ID
     * @param tokenId Token to get the hash from
     * @return Returns a string containing the token hash
     */
    function getHash(uint256 tokenId) public view returns (string memory) {
        return tokenIdToHash[tokenId];
    }

    /**
     * @dev Get the number of tokens associated with a specific hash held by the token owner
     * For example, if collaborators are working on a token series, this would return all of them for one collaborator
     * @param owner Address of the owner of the token
     * @param hash Hash to query
     * @return Return the balance as a number of tokens
     * Example args: 0x08E242bB06D85073e69222aF8273af419d19E4f6, 0x1
     */
    function balanceOfHash(address owner, string memory hash)
        public
        view
        returns (uint256)
    {
        uint256 count = 0;
        uint256 balance = balanceOf(owner);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            string memory h = tokenIdToHash[tokenId];
            if (streq(h, hash)) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get the start token id of a hash
     * @param hash Hash to query
     * @return Start of token id for this hash
     */
    function startTokenIdOfHash(string memory hash)
        public
        view
        returns (uint256)
    {
        return hashToStartTokenId[hash];
    }

    /**
     * @dev Get the total supply of a hash
     * @param hash Hash to query
     * @return Total supply of the token
     */
    function totalSupplyOfHash(string memory hash)
        public
        view
        returns (uint256)
    {
        return hashToTotalSupply[hash];
    }

    /**
     * @dev List the tokens IDs owned by an account
     * @param owner Address to query
     * @return Array of token IDs
     */
    function getTokenIdsOf(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 count = balanceOf(owner);
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ids;
    }

    /**
     * @dev Get the complete information for a token from it's ID
     * @param tokenId Token ID to query
     * @return Token struct containing token data
     */
    function tokenByIdFull(uint256 tokenId) public view returns (Token memory) {
        string memory hash;
        string memory name;
        string memory ext;
        if (isSingleIssue) {
            hash = getSingleMetadata(tokenId, "hash");
            name = tokenIdToHash[tokenId];
            ext = getSingleMetadata(tokenId, "ext");
        } else {
            hash = tokenIdToHash[tokenId];
            name = getMetadata(hash, "name");
            ext = getMetadata(hash, "ext");
        }

        address minter = minters[tokenId];
        address owner = _exists(tokenId) ? ownerOf(tokenId) : address(0);
        uint256 totalSupply = hashToTotalSupply[hash];
        return Token(tokenId, hash, name, ext, minter, owner, 0, totalSupply);
    }

    /**
     * @dev Get the full Token struct from an owner address at a specific index
     * @param owner Owner to query
     * @param index Index in owner's balance to query
     * @return Token struct containing token data
     */
    function tokenOfOwnerByIndexFull(address owner, uint256 index)
        public
        view
        returns (Token memory)
    {
        uint256 tokenId = tokenOfOwnerByIndex(owner, index);
        string memory hash;
        string memory name;
        string memory ext;
        if (isSingleIssue) {
            hash = getSingleMetadata(tokenId, "hash");
            name = tokenIdToHash[tokenId];
            ext = getSingleMetadata(tokenId, "ext");
        } else {
            hash = tokenIdToHash[tokenId];
            name = getMetadata(hash, "name");
            ext = getMetadata(hash, "ext");
        }
        address minter = minters[tokenId];
        uint256 balance = balanceOfHash(owner, hash);
        uint256 totalSupply = hashToTotalSupply[hash];
        return
            Token(
                tokenId,
                hash,
                name,
                ext,
                minter,
                owner,
                balance,
                totalSupply
            );
    }

    /**
     * @dev Get metadata for the token. Metadata is a key-value store that can be set by owners and collaborators
     * @param hash Token hash to query for metadata
     * @param key Key to query for a value
     * @return Value corresponding to metadata key
     */
    function getMetadata(string memory hash, string memory key)
        public
        view
        returns (string memory)
    {
        for (uint256 i = 0; i < hashToMetadata[hash].length; i++) {
            if (streq(hashToMetadata[hash][i].key, key)) {
                return hashToMetadata[hash][i].value;
            }
        }
        return "";
    }

    /**
     * @dev Set metadata for the token. Metadata is a key-value store that can be set by owners and collaborators
     * @param hash Token hash to add metadata to
     * @param key Key to store value at
     * @param value Value to store
     */
    function setMetadata(
        string memory hash,
        string memory key,
        string memory value
    ) public {
        require(isCollaborator(hash, msg.sender), "not a collaborator");

        bool keyFound = false;
        for (uint256 i = 0; i < hashToMetadata[hash].length; i++) {
            if (streq(hashToMetadata[hash][i].key, key)) {
                hashToMetadata[hash][i].value = value;
                keyFound = true;
                break;
            }
        }
        if (!keyFound) {
            hashToMetadata[hash].push(Metadata(key, value));
        }

        emit MetadataSet(hash, key, value);
    }

    /**
     * @dev Get metadata for a single token (non-hashed)
     * @param tokenId Token hash to add metadata to
     * @param key Key to retrieve value for
     * @return Returns the value stored for the key
     */
    function getSingleMetadata(uint256 tokenId, string memory key)
        public
        view
        returns (string memory)
    {
        for (uint256 i = 0; i < tokenIdToMetadata[tokenId].length; i++) {
            if (streq(tokenIdToMetadata[tokenId][i].key, key)) {
                return tokenIdToMetadata[tokenId][i].value;
            }
        }
        return "";
    }

    /**
     * @dev Set metadata for a single token (non-hashed)
     * @param tokenId Token hash to add metadata to
     * @param key Key to store value at
     * @param value Value to store
     */
    function setSingleMetadata(
        uint256 tokenId,
        string memory key,
        string memory value
    ) public {
        require(
            ownerOf(tokenId) == msg.sender ||
                isSingleCollaborator(tokenId, msg.sender),
            "not an owner or collaborator"
        );

        bool keyFound = false;
        for (uint256 i = 0; i < tokenIdToMetadata[tokenId].length; i++) {
            if (streq(tokenIdToMetadata[tokenId][i].key, key)) {
                tokenIdToMetadata[tokenId][i].value = value;
                keyFound = true;
                break;
            }
        }
        if (!keyFound) {
            tokenIdToMetadata[tokenId].push(Metadata(key, value));
        }

        emit SingleMetadataSet(tokenId, key, value);
    }

    /**
     * @dev Update token hash with a new hash
     * @param oldHash Old hash to query
     * @param newHash New hash to set
     */
    function updateHash(string memory oldHash, string memory newHash) public {
        require(hashToTotalSupply[oldHash] > 0, "old hash does not exist");
        require(hashToTotalSupply[newHash] == 0, "new hash already exists");
        require(isCollaborator(oldHash, msg.sender), "not a collaborator");

        uint256 startTokenId = hashToStartTokenId[oldHash];
        uint256 totalSupply = hashToTotalSupply[oldHash];
        for (uint256 i = 0; i < totalSupply; i++) {
            tokenIdToHash[startTokenId + i] = newHash;
        }

        hashToStartTokenId[newHash] = hashToStartTokenId[oldHash];
        hashToTotalSupply[newHash] = hashToTotalSupply[oldHash];
        hashToMetadata[newHash] = hashToMetadata[oldHash];
        hashToCollaborators[newHash] = hashToCollaborators[oldHash];

        delete hashToStartTokenId[oldHash];
        delete hashToTotalSupply[oldHash];
        delete hashToMetadata[oldHash];
        delete hashToCollaborators[oldHash];

        emit HashUpdate(oldHash, newHash);
    }

    /**@dev Helper function to convert a uint to a string
     * @param _i uint to convert
     * @return _uintAsString string converted from uint
     */
    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }
}
