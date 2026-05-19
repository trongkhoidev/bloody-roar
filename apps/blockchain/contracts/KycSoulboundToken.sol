// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KycSoulboundToken is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping of verified addresses to check if they hold an active KYC token
    mapping(address => bool) private _isKycVerified;
    mapping(address => uint256) private _userTokenId;

    event KycMinted(address indexed user, uint256 indexed tokenId);
    event KycRevoked(address indexed user, uint256 indexed tokenId);

    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {}

    /**
     * Mint a secure KYC SBT to a user. Only the owner (Arbiter/Platform) can trigger this.
     */
    function mintKycToken(address to) public onlyOwner returns (uint256) {
        require(to != address(0), "KYC: Mint to the zero address");
        require(!_isKycVerified[to], "KYC: Address is already verified");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        _isKycVerified[to] = true;
        _userTokenId[to] = tokenId;

        emit KycMinted(to, tokenId);
        return tokenId;
    }

    /**
     * Revoke a KYC token if user commits fraud or account is suspended. Only Owner.
     */
    function revokeKycToken(address user) public onlyOwner {
        require(_isKycVerified[user], "KYC: User does not have a KYC token");
        
        uint256 tokenId = _userTokenId[user];
        _burn(tokenId);
        
        _isKycVerified[user] = false;
        delete _userTokenId[user];

        emit KycRevoked(user, tokenId);
    }

    /**
     * Check if a specific address is KYC-verified.
     */
    function isVerified(address user) public view returns (bool) {
        return _isKycVerified[user];
    }

    /**
     * Retrieve the token ID for a verified address.
     */
    function getTokenId(address user) public view returns (uint256) {
        require(_isKycVerified[user], "KYC: User is not verified");
        return _userTokenId[user];
    }

    /**
     * Modern OpenZeppelin v5 _update hook override.
     * Prevents all transfers between non-zero addresses, making the token strictly Soulbound.
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Prevent all transfers (from != 0 && to != 0)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer is forbidden");
        }
        
        return super._update(to, tokenId, auth);
    }
}
