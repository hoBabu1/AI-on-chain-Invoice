import { createAndUploadInvoice } from './uploadJsonFile.js';

// Call the function
const { ipfsUrl, amount } = await createAndUploadInvoice();

console.log(ipfsUrl);  // "https://gateway.pinata.cloud/ipfs/bafkreif..."
console.log(amount);   // 1000n (as uint256/BigInt)