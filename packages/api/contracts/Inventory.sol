// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;

import "./ERC721.sol";
import "./EnumerableSet.sol";
import "./ERC721Enumerable.sol";

import "./Math.sol";
import "./Currency.sol";

/**
 * @title Extension of {ERC721} for assets
 * I.E. collaborators and separate creatorship and ownership
 */
contract Inventory is ERC721Enumerable {
    using EnumerableSet for EnumerableSet.UintSet;

    Currency internal coinContract; // ERC20 contract for fungible assets
    uint256 internal mintFee; // ERC20 fee to mint ERC721
    address internal treasuryAddress; // address into which we deposit minting fees
    bool internal isPublicallyMintable; // whether anyone can mint assets in this copy of the contract
    mapping(address => bool) internal allowedMinters; // addresses allowed to mint in this copy of the contract
    uint256 internal nextAssetId = 0; // the next asset id to use (increases linearly)
    mapping(uint256 => string) internal assetIdToHash; // map of asset id to hash it represents
    mapping(string => uint256) internal hashToStartAssetId; // map of hashes to start of asset ids for it
    mapping(string => uint256) internal hashToTotalSupply; // map of hash to total number of assets for it
    mapping(string => Metadata[]) internal hashToMetadata; // map of hash to metadata key-value store
    mapping(string => address[]) internal hashToCollaborators; // map of hash to addresses that can change metadata
    mapping(uint256 => uint256) internal assetIdToBalance; // map of assets to packed balance
    mapping(uint256 => address) internal minters; // map of assets to minters
    mapping(uint256 => Metadata[]) internal assetIdToMetadata; // map of asset id to metadata key-value store
    mapping(uint256 => address[]) internal assetIdToCollaborators; // map of asset id to addresses that can change metadata

    struct Metadata {
        string key;
        string value;
    }

    struct Asset {
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
    event SingleMetadataSet(uint256 assetId, string key, string value);
    event HashUpdate(string oldHash, string newHash);
    event CollaboratorAdded(string hash, address a);
    event CollaboratorRemoved(string hash, address a);
    event SingleCollaboratorAdded(uint256 assetId, address a);
    event SingleCollaboratorRemoved(uint256 assetId, address a);

    /**
     * @dev Create this ERC721 contract
     * @param name Name of the contract (default is "Inventory")
     * @param symbol Symbol for the asset (default is ???)
     * @param baseUri Base URI (example is http://)
     * @param _coinContract ERC20 contract attached to fungible assets
     * @param _treasuryAddress Address of the treasury account
     * @param _isPublicallyMintable Whether anyone can mint assets with this contract
     * I.E. collaborators and separate creatorship and ownership
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri,
        Currency _coinContract,
        uint256 _mintFee,
        address _treasuryAddress,
        bool _isPublicallyMintable
    ) ERC721(name, symbol) {
        _setBaseURI(baseUri);
        coinContract = _coinContract;
        mintFee = _mintFee;
        treasuryAddress = _treasuryAddress;
        isPublicallyMintable = _isPublicallyMintable;
        allowedMinters[msg.sender] = true;
    }

    /**
     * @dev Set the price to mint
     * @param _mintFee Minting fee, default is 10 Currency
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
     * @param _treasuryAddress Address of the treasurer
     */
    function setTreasuryAddress(address _treasuryAddress) public {
        require(
            msg.sender == treasuryAddress,
            "must be set from treasury address"
        );
        treasuryAddress = _treasuryAddress;
    }

    /**
     * @dev Mint one or more non-fungible assets with this contract
     * The count parameter is what is looped over to create the asset.
     * This means the hiegher the count, the higher the gas.
     * This is the main reason that we can only mint so many assets at once.
     * @param to Address of who is receiving the asset on mint
     * Example: 0x08E242bB06D85073e69222aF8273af419d19E4f6
     * @param hash Hash of the file to mint
     * Example: 0x1
     * @param name Name of the asset
     * @param ext File extension of the asset
     * Example: "png"
     * @param description Description of the asset (set by user)
     * @param count Number of assets to mint (ie: 1)
     */
    function mint(
        address to,
        string memory hash,
        string memory name,
        string memory ext,
        string memory description,
        uint256 count
    ) public {
        require(
            isPublicallyMintable || isAllowedMinter(msg.sender),
            "not allowed to mint"
        ); // Only allowed minters can mint
        require(bytes(hash).length > 0, "hash cannot be empty"); // Hash cannot be empty (minting null items)
        require(count > 0, "count must be greater than zero"); // Count must be 1 or more (cannot mint no items)
        //require(hashToTotalSupply[hash] == 0, "hash already exists"); // Prevent multiple mints of the same file (all files minted must be unique)

        hashToStartAssetId[hash] = nextAssetId + 1; // Increment asset ID by one

        uint256 i = 0;
        while (i < count) {
            // Each asset gets a new asset ID, even if minted in a set
            nextAssetId = SafeMath.add(nextAssetId, 1);
            uint256 assetId = nextAssetId;

            _mint(to, assetId);
            minters[assetId] = to;

            assetIdToHash[assetId] = hash;
            i++;
        }
        hashToTotalSupply[hash] = count;
        hashToMetadata[hash].push(Metadata("name", name));
        hashToMetadata[hash].push(Metadata("ext", ext));
        hashToMetadata[hash].push(Metadata("description", description));
        hashToCollaborators[hash].push(to);

        // Unless the mint free, transfer fungible assets and attempt to pay the fee
        if (mintFee != 0) {
            require(
                coinContract.transferFrom(
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
        hashToStartAssetId[hash] = nextAssetId + 1; // Increment asset ID by one

        uint256 assetId = nextAssetId;
        _mint(to, assetId);
        minters[assetId] = to;
        assetIdToHash[assetId] = hash;
        hashToTotalSupply[hash] = 1;
        hashToCollaborators[hash].push(to);
        
        if (mintFee != 0) {
            require(
                coinContract.transferFrom(
                    msg.sender,
                    treasuryAddress,
                    mintFee
                ),
                "mint transfer failed"
            );
        }
        
    }

    /**
     * @dev Get the address for for the minter of the asset
     * @param assetId ID of the asset we are querying
     * @return Address of the minter
     */
    function getMinter(uint256 assetId) public view returns (address) {
        return minters[assetId];
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
     * @dev Mint a asset with a specific ID
     * @param to Who should receive the minted asset
     * @param assetId ID of the asset to mint (ie: 250)
     */
    function mintAssetId(address to, uint256 assetId) public {
        require(isAllowedMinter(msg.sender), "minter not allowed");

        _mint(to, assetId);
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
     * @dev Get the URI of a asset
     * @param assetId Asset to get the URI from (ie: 250)
     * @return URI of the asset to retrieve
     */
    function tokenURI(uint256 assetId)
        public
        view
        override
        returns (string memory)
    {
        return string(abi.encodePacked(_getBaseURI(), uint2str(assetId)));
    }

    /**
     * @dev Check if the asset exists
     * @param assetId Asset to test
     * @return Returns true if the asset exists
     */
    function assetExists(uint256 assetId) public view returns (bool) {
        return _exists(assetId);
    }

    /**
     * @dev Check if an account is allowed to mint assets
     * @param a Address to check
     * @return Returns true if the acount can mint
     */
    function isAllowedMinter(address a) public view returns (bool) {
        return allowedMinters[a];
    }

    /**
     * @dev Add a minter to the approved list to mint assets
     * @param a Address to whitelist
     */
    function addAllowedMinter(address a) public {
        require(isAllowedMinter(msg.sender));
        require(!isAllowedMinter(a), "target is already a minter");
        allowedMinters[a] = true;
    }

    /**
     * @dev Remove a minter from the approved list to mint assets
     * @param a Address to remove from whitelist
     */
    function removeAllowedMinter(address a) public {
        require(isAllowedMinter(msg.sender), "sender is not a minter");
        require(isAllowedMinter(a), "target is not a minter");
        allowedMinters[a] = false;
    }

    /**
     * @dev Check is an address has access as a collaborator (for development of a asset between multiple users)
     * @param hash Hash of the asset to test
     * @param a Address to query
     * @return Returns true if the address is a collaborator on this asset
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
     * @dev List collaborators for a asset
     * @param hash Hash of the asset to get collaborators for
     */
    function getCollaborators(string memory hash) public view returns (address[] memory) {
        address[] memory collaborators = hashToCollaborators[hash];
        return collaborators;
    }

    /**
     * @dev Add collaborator to a asset
     * @param hash Hash of the asset to add the collaborator to
     * @param a Address to whitelist
     */
    function addCollaborator(string memory hash, address a) public {
        require(isCollaborator(hash, msg.sender), "you are not a collaborator");
        require(!isCollaborator(hash, a), "they are already a collaborator");
        hashToCollaborators[hash].push(a);
        
        emit CollaboratorAdded(hash, a);
    }

    /**
     * @dev Remove collaborator from a asset
     * @param hash Hash of the asset to remove the collaborator from
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
     * @dev Check if this address is a collaborator on a single issue asset
     * @param assetId ID of the asset
     * @param a Address to check
     * @return Returns true if the address is a collaborator on the asset
     */
    function isSingleCollaborator(uint256 assetId, address a)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < assetIdToCollaborators[assetId].length; i++) {
            if (assetIdToCollaborators[assetId][i] == a) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev List collaborators for a asset
     * @param assetId Asset ID of the asset to get collaborators for
     */
    function getSingleCollaborators(uint256 assetId) public view returns (address[] memory) {
        address[] memory collaborators = assetIdToCollaborators[assetId];
        return collaborators;
    }

    /**
     * @dev Add a collaborator to a single asset
     * @param assetId ID of the asset
     * @param a Address to whitelist
     */
    function addSingleCollaborator(uint256 assetId, address a) public {
        require(
            ownerOf(assetId) == a || isSingleCollaborator(assetId, msg.sender),
            "you are not a collaborator"
        );
        require(
            !isSingleCollaborator(assetId, a),
            "they are already a collaborator"
        );
        assetIdToCollaborators[assetId].push(a);
        
        emit SingleCollaboratorAdded(assetId, a);
    }

    /**
     * @dev Remove a collaborator from a single asset
     * @param assetId ID of the asset
     * @param a Address to remove from whitelist
     */
    function removeSingleCollaborator(uint256 assetId, address a) public {
        require(
            ownerOf(assetId) == a || isSingleCollaborator(assetId, msg.sender),
            "you are not a collaborator"
        );
        require(
            isSingleCollaborator(assetId, msg.sender),
            "they are not a collaborator"
        );

        uint256 newSize = 0;
        for (uint256 i = 0; i < assetIdToCollaborators[assetId].length; i++) {
            if (assetIdToCollaborators[assetId][i] != a) {
                newSize++;
            }
        }

        address[] memory newAssetIdCollaborators = new address[](newSize);
        uint256 index = 0;
        for (uint256 i = 0; i < assetIdToCollaborators[assetId].length; i++) {
            address oldAssetIdCollaborator = assetIdToCollaborators[assetId][i];
            if (oldAssetIdCollaborator != a) {
                newAssetIdCollaborators[index++] = oldAssetIdCollaborator;
            }
        }
        assetIdToCollaborators[assetId] = newAssetIdCollaborators;
        
        emit SingleCollaboratorRemoved(assetId, a);
    }

    /**
     * @dev Seal the asset forever and remove collaborators so that it can't be altered
     * @param hash Hash of the collaborative asset
     */
    function seal(string memory hash) public {
        require(isCollaborator(hash, msg.sender), "not a collaborator");
        delete hashToCollaborators[hash];
    }

    /**
     * @dev Get the hash of a asset by ID
     * @param assetId Asset to get the hash from
     * @return Returns a string containing the asset hash
     */
    function getHash(uint256 assetId) public view returns (string memory) {
        return assetIdToHash[assetId];
    }

    /**
     * @dev Get the number of assets associated with a specific hash held by the asset owner
     * For example, if collaborators are working on a asset series, this would return all of them for one collaborator
     * @param owner Address of the owner of the asset
     * @param hash Hash to query
     * @return Return the balance as a number of assets
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
            uint256 assetId = tokenOfOwnerByIndex(owner, i);
            string memory h = assetIdToHash[assetId];
            if (streq(h, hash)) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get the start asset id of a hash
     * @param hash Hash to query
     * @return Start of asset id for this hash
     */
    function startAssetIdOfHash(string memory hash)
        public
        view
        returns (uint256)
    {
        return hashToStartAssetId[hash];
    }

    /**
     * @dev Get the total supply of a hash
     * @param hash Hash to query
     * @return Total supply of the asset
     */
    function totalSupplyOfHash(string memory hash)
        public
        view
        returns (uint256)
    {
        return hashToTotalSupply[hash];
    }

    /**
     * @dev List the assets IDs owned by an account
     * @param owner Address to query
     * @return Array of asset IDs
     */
    function getAssetIdsOf(address owner)
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
     * @dev Get the complete information for a asset from it's ID
     * @param assetId Asset ID to query
     * @return Asset struct containing asset data
     */
    function assetByIdFull(uint256 assetId) public view returns (Asset memory) {
        string memory hash;
        string memory name;
        string memory ext;
        hash = assetIdToHash[assetId];
        name = getMetadata(hash, "name");
        ext = getMetadata(hash, "ext");

        address minter = minters[assetId];
        address owner = _exists(assetId) ? ownerOf(assetId) : address(0);
        uint256 totalSupply = hashToTotalSupply[hash];
        return Asset(assetId, hash, name, ext, minter, owner, 0, totalSupply);
    }

    /**
     * @dev Get the full Asset struct from an owner address at a specific index
     * @param owner Owner to query
     * @param index Index in owner's balance to query
     * @return Asset struct containing asset data
     */
    function tokenOfOwnerByIndexFull(address owner, uint256 index)
        public
        view
        returns (Asset memory)
    {
        uint256 assetId = tokenOfOwnerByIndex(owner, index);
        string memory hash;
        string memory name;
        string memory ext;
        hash = getSingleMetadata(assetId, "hash");
        name = assetIdToHash[assetId];
        ext = getSingleMetadata(assetId, "ext");

        address minter = minters[assetId];
        uint256 balance = balanceOfHash(owner, hash);
        uint256 totalSupply = hashToTotalSupply[hash];
        return
            Asset(
                assetId,
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
     * @dev Get metadata for the asset. Metadata is a key-value store that can be set by owners and collaborators
     * @param hash Asset hash to query for metadata
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
     * @dev Set metadata for the asset. Metadata is a key-value store that can be set by owners and collaborators
     * @param hash Asset hash to add metadata to
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
     * @dev Get metadata for a single asset (non-hashed)
     * @param assetId Asset hash to add metadata to
     * @param key Key to retrieve value for
     * @return Returns the value stored for the key
     */
    function getSingleMetadata(uint256 assetId, string memory key)
        public
        view
        returns (string memory)
    {
        for (uint256 i = 0; i < assetIdToMetadata[assetId].length; i++) {
            if (streq(assetIdToMetadata[assetId][i].key, key)) {
                return assetIdToMetadata[assetId][i].value;
            }
        }
        return "";
    }

    /**
     * @dev Set metadata for a single asset (non-hashed)
     * @param assetId Asset hash to add metadata to
     * @param key Key to store value at
     * @param value Value to store
     */
    function setSingleMetadata(
        uint256 assetId,
        string memory key,
        string memory value
    ) public {
        require(
            ownerOf(assetId) == msg.sender ||
                isSingleCollaborator(assetId, msg.sender),
            "not an owner or collaborator"
        );

        bool keyFound = false;
        for (uint256 i = 0; i < assetIdToMetadata[assetId].length; i++) {
            if (streq(assetIdToMetadata[assetId][i].key, key)) {
                assetIdToMetadata[assetId][i].value = value;
                keyFound = true;
                break;
            }
        }
        if (!keyFound) {
            assetIdToMetadata[assetId].push(Metadata(key, value));
        }

        emit SingleMetadataSet(assetId, key, value);
    }

    /**
     * @dev Update asset hash with a new hash
     * @param oldHash Old hash to query
     * @param newHash New hash to set
     */
    function updateHash(string memory oldHash, string memory newHash) public {
        require(hashToTotalSupply[oldHash] > 0, "old hash does not exist");
        require(hashToTotalSupply[newHash] == 0, "new hash already exists");
        require(isCollaborator(oldHash, msg.sender), "not a collaborator");

        uint256 startAssetId = hashToStartAssetId[oldHash];
        uint256 totalSupply = hashToTotalSupply[oldHash];
        for (uint256 i = 0; i < totalSupply; i++) {
            assetIdToHash[startAssetId + i] = newHash;
        }

        hashToStartAssetId[newHash] = hashToStartAssetId[oldHash];
        hashToTotalSupply[newHash] = hashToTotalSupply[oldHash];
        hashToMetadata[newHash] = hashToMetadata[oldHash];
        hashToCollaborators[newHash] = hashToCollaborators[oldHash];

        delete hashToStartAssetId[oldHash];
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
