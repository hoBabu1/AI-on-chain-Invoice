import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import { createInvoice } from '../AI/getInvoiceJson.js';


// Your Pinata JWT API Key (Replace with your actual key)
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YjM2MzczYS02OTdlLTQ5YWUtYmRjYy02MzM1NTE5ZTc2M2YiLCJlbWFpbCI6ImFtYW5rc2FoMTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlMjUyOWM2ZWQ3YTY2N2QwNDY5ZSIsInNjb3BlZEtleVNlY3JldCI6IjA0NDFhMzdiZmZhMGI2NjdhMzk2YmI0MDI0MWQ3NGNmNzgwYTZmYTFmMzlhZGNlZWZiMDhiNDE5ZGIxMjVlNDQiLCJleHAiOjE3OTA4NDAyMTB9.Gkh9lQYE2yQxsGm8KcsfKZAt7QAa3JeqOJgKPZ2BZOA";


async function uploadJsonToPinata(jsonData) {
  try {
    // Convert JSON to Buffer
    const jsonBuffer = Buffer.from(JSON.stringify(jsonData, null, 2));
    
    // Prepare form data
    const formData = new FormData();
    formData.append("file", jsonBuffer, {
      filename: `invoice-${Date.now()}.json`,
      contentType: "application/json",
    });
    formData.append("network", "public");
    
    // Upload to Pinata
    const response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

/**
 * Main function to create invoice and upload to Pinata
 * @returns {Promise<{ipfsUrl: string, amount: bigint}>}
 */
async function createAndUploadInvoice() {
  try {
    // Step 1: Get invoice details and generate JSON
    const invoiceJson = await createInvoice();
    
    if (!invoiceJson) {
      throw new Error("Invoice creation failed");
    }
    
    // Step 2: Upload to Pinata
    const uploadResult = await uploadJsonToPinata(invoiceJson);
    
    if (!uploadResult.data || !uploadResult.data.cid) {
      throw new Error("Upload failed - no CID returned");
    }
    
    // Step 3: Extract and format the required data
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${uploadResult.data.cid}`;
    
    // Convert amount to uint256 (assuming amount is in the invoice JSON)
    // If amount is in dollars, convert to wei (multiply by 10^18) or keep as is based on your needs
    const amount = BigInt(invoiceJson.amount || 0);
    
    return {
      ipfsUrl,
      amount
    };
    
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Export the function
export { createAndUploadInvoice };

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  createAndUploadInvoice()
    .then(result => {
      console.log("\n✅ Success!");
      console.log("IPFS URL:", result.ipfsUrl);
      console.log("Amount (uint256):", result.amount.toString());
    })
    .catch(error => {
      console.error("Failed:", error.message);
      process.exit(1);
    });
}