import "@nomiclabs/hardhat-ethers";
import hre from "hardhat";

async function main() {
  const accounts = hre.config.networks.hardhat.accounts;
  const index = 0; // first wallet, increment for next wallets
  const wallet1 = hre.ethers.Wallet.fromMnemonic(
    accounts.mnemonic,
    accounts.path + `/${index}`
  );

  const privateKey1 = wallet1.privateKey;
  console.log(`Private Key for ${wallet1.address}: ${privateKey1}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
