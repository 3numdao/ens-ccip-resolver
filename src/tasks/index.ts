import { TASK_COMPILE, TASK_NODE } from "hardhat/builtin-tasks/task-names";
import { task, types } from "hardhat/config";

import { ENSResolver__factory } from "../../src/types";

task("run-local", "Start a hardhat node with no additional setup").setAction(
  async (_, { config, run, ethers }) => {
    await run(TASK_COMPILE);

    const accounts = config.networks.hardhat.accounts;
    const index = 0; // first wallet, increment for next wallets
    const wallet1 = ethers.Wallet.fromMnemonic(
      accounts.mnemonic,
      accounts.path + `/${index}`
    );

    const privateKey1 = wallet1.privateKey;
    console.log(`Wallet ${wallet1.address}, Private Key: ${privateKey1}`);

    await Promise.race([
      run(TASK_NODE),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);

    await new Promise(() => {
      /* keep node alive until this process is killed */
    });
  }
);

task("deploy-resolver", "Deploy ENS Resolver with URL")
  .addParam(
    "url",
    "The CCIP URL usually of form http://api.host.com/r/{sender}/{data}"
  )
  .addOptionalParam(
    "signer",
    "Adds initial signer used to verify off chain resolutions, uses deployer if not set",
    "",
    types.string
  )
  .addOptionalParam(
    "owner",
    "Sets owner of the resolver, uses deployer if not set",
    "",
    types.string
  )
  .addOptionalParam(
    "smanager",
    "Sets signer manager, uses deployer if not set",
    "",
    types.string
  )
  .addOptionalParam(
    "gwmanager",
    "Sets gateway manager, uses deployer if not set",
    "",
    types.string
  )

  .setAction(async (args, { ethers }) => {
    // Sanity check the required parameters
    if (args.url.length < 7)
      throw new Error(
        `Invalid URL, must be length 7 or more got "${args.url}"`
      );

    const deployer = (await ethers.getSigners())[0];

    const owner = args.owner || deployer.address;
    const smanager = args.smanager || deployer.address;
    const gwmanager = args.gwmanager || deployer.address;
    const signer = args.signer || deployer.address;

    // Validate the addresses
    ethers.utils.getAddress(owner);
    ethers.utils.getAddress(smanager);
    ethers.utils.getAddress(gwmanager);
    ethers.utils.getAddress(signer);

    const resolverFactory = await ethers.getContractFactory("ENSResolver");

    const constructorArgs: [string, string, string, string, string[]] = [
      owner,
      smanager,
      gwmanager,
      args.url,
      [signer],
    ];

    const iENSResolver = ENSResolver__factory.createInterface();
    const constructorData = iENSResolver.encodeDeploy(constructorArgs);

    console.log(
      `Deploying ENSResolver using deployer address ${deployer.address}...\n\n` +
        `Constructor arguments:\n${JSON.stringify(constructorArgs)}\n\n` +
        `Constructor calldata:\n${constructorData}\n`
    );

    const implementation = await resolverFactory.deploy(...constructorArgs);
    await implementation.deployed();
    console.log("-> Deployed ENSResolver contract at", implementation.address);
  });
