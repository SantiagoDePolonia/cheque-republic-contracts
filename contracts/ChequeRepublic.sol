// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Cheque Republic contract
/// @author SantiagoDePolonia
/// @notice This contract allows users to preauthorize a cheque to be cashed by an selecter account
///         and to cash the cheque the cheque.
///
/// To widthdraw a cheque the payee need to call:
/// 1. commitWithdrawal first to preauthorize the cheque withdrawal
/// 2. withdraw to cash the cheque to the sender address
///
/// To commitWithdrawal method was added to prevent front-running attacks.
contract ChequeRepublic is ReentrancyGuard {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public cashedCheques;
    mapping(bytes32 => address) public pendingCheques;

    /// @notice commit cheque withdrawal before withdraw to prevent front-running attacks
    function commitWithdrawal(
        bytes32 _chequeHash,
        address _drawer,
        bytes memory _signature,
        address _payee
    ) public {
        bytes32 message = keccak256(
            abi.encodePacked(_chequeHash, block.chainid, address(this))
        );
        bytes32 msgToSign = ECDSA.toEthSignedMessageHash(message);
        address signer = ECDSA.recover(msgToSign, _signature);

        require(signer == _drawer, "Invalid signature for preauthorization");
        require(
            pendingCheques[_chequeHash] == address(0x0),
            "Address already set"
        );

        pendingCheques[_chequeHash] = _payee;
    }

    /// @notice This is the second step of withdrawal. If first transaction was validated just send the second one and get tokens from the cheque republic.
    function withdraw(
        bytes32 _chequeHash,
        address _drawer,
        address _token,
        uint _value,
        uint _expirationDate,
        uint _nameHash,
        bytes memory _signature,
        address _payee
    ) public nonReentrant {
        require(
            pendingCheques[_chequeHash] == _payee,
            "Cheque has not been preauthorized"
        );
        require(block.timestamp <= _expirationDate, "Cheque expired");

        bytes32 message = keccak256(
            abi.encodePacked(
                _token,
                _chequeHash,
                _value,
                _expirationDate,
                _nameHash,
                _drawer,
                address(this)
            )
        );
        bytes32 msgToSign = ECDSA.toEthSignedMessageHash(message);
        address signer = ECDSA.recover(msgToSign, _signature);

        require(signer == _drawer, "Invalid signature for withdraw");

        cashedCheques[_chequeHash] = true;

        IERC20(_token).transferFrom(signer, _payee, _value);
    }
}
