// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;

/** @title Identity Contract. */
contract Identity {
    /** @dev Event called when owner changes metadata value. */
    event MetadataSet(address owner, string key, string value);

    /** @dev Mapping of a key like "avatar" to a asset address. */
    mapping(address => mapping(string => string)) private addressToMetadata;

    /**  @dev Read the metadata value for a key
     *  Example: 0x08E242bB06D85073e69222aF8273af419d19E4f6, "avatar"
     *  @param owner Owner of this account
     *  @param key Metadata key to retrieve
     *  @return value as a string
     */
    function getMetadata(address owner, string memory key)
        public
        view
        returns (string memory)
    {
        return addressToMetadata[owner][key];
    }

    /**  @dev Write the metadata value for a key
     *  Example: 0x08E242bB06D85073e69222aF8273af419d19E4f6, "avatar", "<address_of_avatar_asset>"
     *  @param owner Owner of this account
     *  @param key Metadata key to store
     *  @param value Metadata value to store
     */
    function setMetadata(
        address owner,
        string memory key,
        string memory value
    ) public {
        require(msg.sender == owner); // only allow owner to change metadata
        addressToMetadata[owner][key] = value; // store the value in the key-value mapping

        emit MetadataSet(owner, key, value); // emit the MetadataSet event
    }
}
