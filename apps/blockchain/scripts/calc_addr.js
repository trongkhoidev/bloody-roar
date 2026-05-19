
const { ethers } = require("ethers");
const address = ethers.getCreateAddress({
  from: "0x11244c33E407a04d07a8d870565F55D8CAae4039",
  nonce: 0
});
console.log(address);
