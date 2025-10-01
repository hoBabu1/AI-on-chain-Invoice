import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

// Your Pinata JWT API Key (Replace with your actual key)
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YjM2MzczYS02OTdlLTQ5YWUtYmRjYy02MzM1NTE5ZTc2M2YiLCJlbWFpbCI6ImFtYW5rc2FoMTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlMjUyOWM2ZWQ3YTY2N2QwNDY5ZSIsInNjb3BlZEtleVNlY3JldCI6IjA0NDFhMzdiZmZhMGI2NjdhMzk2YmI0MDI0MWQ3NGNmNzgwYTZmYTFmMzlhZGNlZWZiMDhiNDE5ZGIxMjVlNDQiLCJleHAiOjE3OTA4NDAyMTB9.Gkh9lQYE2yQxsGm8KcsfKZAt7QAa3JeqOJgKPZ2BZOA";

async function uploadImage(imagePath) {
  try {
    // Read the image file
    const fileStream = fs.createReadStream(imagePath);
    const fileName = path.basename(imagePath);
    
    // Prepare form data
    const formData = new FormData();
    formData.append("file", fileStream, fileName);
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
    console.log("Upload successful!");
    console.log("Response:", result);
    return result;
    
  } catch (error) {
    console.error("Upload failed:", error);
  }
}


// Usage: Replace with your image path
uploadImage("/home/hobabu/hackathon/weMakeDevs/Pinata/image/invoiceImage.webp");
