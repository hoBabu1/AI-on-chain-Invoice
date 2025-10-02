// frontend/pages/api/upload-to-ipfs.js
import FormData from "form-data";
import fetch from "node-fetch";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YjM2MzczYS02OTdlLTQ5YWUtYmRjYy02MzM1NTE5ZTc2M2YiLCJlbWFpbCI6ImFtYW5rc2FoMTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlMjUyOWM2ZWQ3YTY2N2QwNDY5ZSIsInNjb3BlZEtleVNlY3JldCI6IjA0NDFhMzdiZmZhMGI2NjdhMzk2YmI0MDI0MWQ3NGNmNzgwYTZmYTFmMzlhZGNlZWZiMDhiNDE5ZGIxMjVlNDQiLCJleHAiOjE3OTA4NDAyMTB9.Gkh9lQYE2yQxsGm8KcsfKZAt7QAa3JeqOJgKPZ2BZOA";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoiceData } = req.body;

    if (!invoiceData) {
      return res.status(400).json({ error: 'Invoice data required' });
    }

    const finalInvoice = {
      date: new Date().toISOString(),
      recipient: invoiceData.recipient,
      payee: invoiceData.payer,
      amount: invoiceData.amount,
      workingHours: invoiceData.workingHours || null,
      description: invoiceData.description,
      image: "https://ipfs.io/ipfs/bafkreiajzvukrl7agyfngjjhrstqcm3trwer66woe6zweoksdwuvcv6czy"
    };

    const jsonBuffer = Buffer.from(JSON.stringify(finalInvoice, null, 2));
    
    const formData = new FormData();
    formData.append("file", jsonBuffer, {
      filename: `invoice-${Date.now()}.json`,
      contentType: "application/json",
    });
    formData.append("network", "public");
    
    const response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });
    
    const result = await response.json();

    if (!result.data || !result.data.cid) {
      throw new Error("Upload failed - no CID returned");
    }

    const tokenUri = `https://gateway.pinata.cloud/ipfs/${result.data.cid}`;
    const amount = invoiceData.amount || 0;

    return res.status(200).json({
      success: true,
      tokenUri,
      amount,
      ipfsHash: result.data.cid
    });

  } catch (error) {
    console.error('IPFS Upload Error:', error);
    return res.status(500).json({
      error: 'Failed to upload to IPFS',
      message: error.message
    });
  }
}