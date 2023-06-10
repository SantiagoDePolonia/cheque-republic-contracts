import { expect } from "chai";
import { ethers, network } from "hardhat";
import { getBytes, keccak256, solidityPackedKeccak256 } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ChequeRepublic contract", function () {
  const CHEQUE_VALUE = "1000000000000000000"; // 1 ether in wei
  const EXPIRATION: number = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours from now
  const NAME: string = "Test Name";
  const NAME_HASH = keccak256(ethers.encodeBytes32String(NAME));

  async function deployERC20andChequeRepublic() {
    const chainId = await network.provider.send("eth_chainId");
    const [owner, payee, signer] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20Token = await ERC20.connect(owner).deploy(
      "Test Token",
      "TTK",
      await signer.getAddress()
    ); // 10000 ether in wei

    const ChequeContract = await ethers.getContractFactory("ChequeRepublic");
    const chequeContract = await ChequeContract.connect(owner).deploy();

    // Allow the cheque contract to spend the tokens
    await erc20Token
      .connect(signer)
      .approve(await chequeContract.getAddress(), CHEQUE_VALUE);

    // Fund the signer with ERC20 tokens to pay for the cheque
    return { chequeContract, erc20Token, owner, payee, signer, chainId };
  }

  it("Cheque can be cashed successfully", async function () {
    const { chequeContract, erc20Token, signer, payee, chainId } =
      await loadFixture(deployERC20andChequeRepublic);

    // // Generate the cheque hash
    const chequeHash: string = solidityPackedKeccak256(
      ["address", "uint256", "uint256", "uint256", "address"],
      [
        await erc20Token.getAddress(),
        CHEQUE_VALUE,
        EXPIRATION,
        NAME_HASH,
        await signer.getAddress(),
      ]
    );

    // Sign approveAddress message with signer's wallet
    const message1: string = ethers.solidityPackedKeccak256(
      ["bytes32", "uint256", "address"],
      [chequeHash, chainId, await chequeContract.getAddress()]
    );

    const sig1: string = await signer.signMessage(getBytes(message1));

    // Payee approves the cheque
    await chequeContract
      .connect(payee)
      .commitWithdrawal(
        chequeHash,
        await signer.getAddress(),
        sig1,
        await payee.getAddress()
      );

    // Sign withdrawToAddress message with signer's wallet
    const message2: string = solidityPackedKeccak256(
      [
        "address",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "address",
      ],
      [
        await erc20Token.getAddress(),
        chequeHash,
        CHEQUE_VALUE,
        EXPIRATION,
        NAME_HASH,
        await signer.getAddress(),
        await chequeContract.getAddress(),
      ]
    );
    const sig2: string = await signer.signMessage(getBytes(message2));

    await chequeContract
      .connect(payee)
      .withdraw(
        chequeHash,
        await signer.getAddress(),
        await erc20Token.getAddress(),
        CHEQUE_VALUE,
        EXPIRATION,
        NAME_HASH,
        sig2,
        await payee.getAddress()
      );
    // Check that the payee received the tokens
    const balance = await erc20Token.balanceOf(await payee.getAddress());
    expect(String(balance) === CHEQUE_VALUE).to.be.true;
  });
});
