const Poster = artifacts.require("Poster");
module.exports = async function (deployer) {
    const deployment = deployer.deploy(Poster,
        "0x0000000000000000000000000000000000000000", 0);
    const instance = await deployment.await
    const newOwner = '0x47e4c5940B9e6984093dC770b7F6C315649833b6'
    await instance.transferOwnership(newOwner)
};