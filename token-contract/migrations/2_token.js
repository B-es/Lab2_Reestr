const Token = artifacts.require("./Token.sol");
module.exports = async function (deployer) {
    deployer.deploy(Token, "CringeToken", "CRINGE", 10000n * BigInt(1e18));
    const instance = await deployment.await
    const newOwner = '0x47e4c5940B9e6984093dC770b7F6C315649833b6'
    await instance.transferOwnership(newOwner)
};