const Migrations = artifacts.require('Migrations')

module.exports = function (deployer) {
  console.log("hello");
  deployer.deploy(Migrations)
}
