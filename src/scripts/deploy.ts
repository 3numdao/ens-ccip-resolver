import { ENSResolver__factory } from "../../src/types";
import "@nomiclabs/hardhat-ethers";
import hre from "hardhat";

async function main() {
  const { ethers } = hre;

  const deployer = (await ethers.getSigners())[0];
  const resolverFactory = await ethers.getContractFactory("ENSResolver");

  const constructorArgs: [string, string, string, string, string[]] = [
    deployer.address,
    deployer.address,
    deployer.address,
    "http://localhost:3000/r/{sender}/{data}",
    [deployer.address],
  ];

  const iENSResolver = ENSResolver__factory.createInterface();
  const constructorData = iENSResolver.encodeDeploy(constructorArgs);

  console.log(
    "Deploying ENSResolver...\n\n" +
      `Constructor arguments:\n${JSON.stringify(constructorArgs)}\n\n` +
      `Constructor calldata:\n${constructorData}\n`
  );

  const implementation = await resolverFactory.deploy(...constructorArgs);
  await implementation.deployed();
  console.log("-> Deployed ENSResolver contract at", implementation.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
