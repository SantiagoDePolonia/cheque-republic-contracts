import { ethers } from "hardhat";

async function main() {
  const ChequeRepublic = await ethers.deployContract("ChequeRepublic");

  await ChequeRepublic.waitForDeployment();

  console.log(`ChequeRepublic deployed to ${ChequeRepublic.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
