const Inventory = artifacts.require("Inventory");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

contract('Test deployed Inventory', (accounts) => {
  it('should store an information', async () => {
    const InventoryInstance = await Inventory.deployed();
    // Set information "RSK"
	await InventoryInstance.setMintFee(1,{from: "0xf90c251e42367a6387afecba10b95c97eaf3b287"});
    // Get information value
    return assert.isTrue(true);
  });

  it('should store an information', async () => {
    const InventoryInstance = await Inventory.deployed();
    // Set information "RSK"
	await InventoryInstance.mintSingle(InventoryInstance.address,"0x1",{from: "0xf90c251e42367a6387afecba10b95c97eaf3b287"});
    // Get information value
    return assert.isTrue(true);
  });
  
  it('should store an information', async () => {
    const InventoryInstance = await Inventory.deployed();
	await InventoryInstance.mint(InventoryInstance.address,"0x1","QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE","png","",1,{from: "0xf90c251e42367a6387afecba10b95c97eaf3b287"});
    // Get information value
    return assert.isTrue(true);
  });

});