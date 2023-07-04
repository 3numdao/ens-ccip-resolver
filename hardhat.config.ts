import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkUserConfig } from "hardhat/types";

import "./src/tasks";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Ensure that we have all the environment variables we need.
let mnemonic: string = process.env.MNEMONIC || "";
const privateKey: string = process.env.PRIVATE_KEY || "";

if (!mnemonic && !privateKey) {
  console.warn("neither MNEMONIC nor PRIVATE_KEY is not set in the .env file");
  mnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
}

function providerUrl(network: string): string {
  if (process.env.ALCHEMY_API_KEY) {
    return `https://eth-${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  } else if (process.env.INFURA_API_KEY) {
    return `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`;
  } else {
    console.warn(
      "INFURA_API_KEY or ALCHEMY_API_KEY environment variable not set"
    );
  }

  return "";
}

const etherscanApiKey: string | undefined = process.env.ETHERSCAN_API_KEY;

function getChainConfig(network: keyof typeof chainIds): HttpNetworkUserConfig {
  const url: string = providerUrl(network);
  return {
    accounts: privateKey
      ? [privateKey]
      : {
          count: 10,
          mnemonic,
          path: "m/44'/60'/0'/0",
        },
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: privateKey
        ? [{ privateKey, balance: "100000000000000000000" }]
        : { mnemonic },
      chainId: chainIds.hardhat,
    },
    goerli: getChainConfig("goerli"),
    mainnet: getChainConfig("mainnet"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.13",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
};

export default config;
