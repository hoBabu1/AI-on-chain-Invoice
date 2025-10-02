// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YjM2MzczYS02OTdlLTQ5YWUtYmRjYy02MzM1NTE5ZTc2M2YiLCJlbWFpbCI6ImFtYW5rc2FoMTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlMjUyOWM2ZWQ3YTY2N2QwNDY5ZSIsInNjb3BlZEtleVNlY3JldCI6IjA0NDFhMzdiZmZhMGI2NjdhMzk2YmI0MDI0MWQ3NGNmNzgwYTZmYTFmMzlhZGNlZWZiMDhiNDE5ZGIxMjVlNDQiLCJleHAiOjE3OTA4NDAyMTB9.Gkh9lQYE2yQxsGm8KcsfKZAt7QAa3JeqOJgKPZ2BZOA";

// Generate Invoice Route
app.post('/api/generate-invoice', async (req, res) => {
  try {
    const { action, userInvoice, currentInvoice, userFeedback } = req.body;

    if (action === 'generate') {
      const allowAssumptions = await shouldAIAssume(userInvoice);
      const aiResponse = await generateInvoice(userInvoice, allowAssumptions);
      const parsedData = JSON.parse(aiResponse);

      // Ensure amount is a pure number
      if (parsedData.amount) {
        parsedData.amount = parseFloat(parsedData.amount);
      }

      if (!parsedData.amount || parsedData.amount <= 0) {
        return res.status(400).json({ error: 'Missing or invalid amount' });
      }

      return res.json({ success: true, invoice: parsedData });

    } else if (action === 'update') {
      const aiResponse = await updateInvoice(currentInvoice, userFeedback);
      const parsedData = JSON.parse(aiResponse);
      
      // Ensure amount is a pure number
      if (parsedData.amount) {
        parsedData.amount = parseFloat(parsedData.amount);
      }

      return res.json({ success: true, invoice: parsedData });
    }

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload to IPFS Route
app.post('/api/upload-to-ipfs', async (req, res) => {
  try {
    const { invoiceData } = req.body;

    if (!invoiceData || !invoiceData.amount) {
      return res.status(400).json({ error: 'Invalid invoice data' });
    }

    const finalInvoice = {
      date: new Date().toISOString(),
      recipient: invoiceData.recipient,
      payee: invoiceData.payer,
      amount: parseFloat(invoiceData.amount),
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

    if (!result.data?.cid) {
      throw new Error("Upload failed");
    }

    const tokenUri = `https://gateway.pinata.cloud/ipfs/${result.data.cid}`;

    res.json({
      success: true,
      tokenUri,
      amount: parseFloat(invoiceData.amount)
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function shouldAIAssume(userInput) {
  const assumeKeywords = [
    'calculate yourself', 'you calculate', 'figure it out',
    'estimate', 'you decide', 'assume', 'your own',
    'work it out', 'determine', 'guess'
  ];
  
  const lowerInput = userInput.toLowerCase();
  if (assumeKeywords.some(keyword => lowerInput.includes(keyword))) {
    return true;
  }
  
  try {
    const intentCheckPrompt = `Analyze if the user is asking you to calculate, estimate, or assume missing invoice details.

User message: "${userInput}"

Respond with ONLY "YES" or "NO".`;

    const resp = await client.chat.completions.create({
      model: "llama3.1-8b",
      messages: [{ role: "user", content: intentCheckPrompt }],
      temperature: 0.1,
      max_tokens: 10
    });

    return resp.choices[0].message.content.trim().toUpperCase().includes('YES');
  } catch (error) {
    return false;
  }
}

async function generateInvoice(userInvoice, allowAssumptions) {
  const systemPrompt = `You are an invoice processing assistant. Extract information and return valid JSON.

CRITICAL RULES:
- RECIPIENT = Person who DID the work
- PAYER = Person who WILL PAY (client)
- AMOUNT must be a NUMBER only (no $, no text, just the number)

Return this EXACT JSON format:
{
  "amount": <number>,
  "description": "<work description>",
  "payer": "<client name>",
  "recipient": "<worker name>",
  "workingHours": <number or null>
}

EXTRACTION:
1. RECIPIENT: "I am X", "my name is X"
2. PAYER: "for Y", "Y's project"
3. AMOUNT: Extract ONLY the number (remove $, dollar, etc)
4. HOURS: Extract if mentioned
5. DESCRIPTION: Brief work description

${allowAssumptions ? 'ASSUMPTION MODE: Estimate missing values based on work type.' : 'STRICT MODE: Extract only what is provided.'}

Return ONLY JSON, no explanations.`;

  const resp = await client.chat.completions.create({
    model: "llama3.1-8b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInvoice }
    ],
    temperature: 0.1,
    max_tokens: 500
  });

  return resp.choices[0].message.content;
}

async function updateInvoice(currentInvoice, userFeedback) {
  const systemPrompt = `Update this invoice based on feedback.

CURRENT INVOICE:
${JSON.stringify(currentInvoice, null, 2)}

USER FEEDBACK: "${userFeedback}"

CRITICAL RULES FOR UPDATES:
1. If feedback says "amount is 70" or "make amount 70" or "70 dollar" → Set amount to 70 (number only, no $ sign)
2. If feedback says "amount 60" → Set amount to 60
3. Extract ONLY the pure number from amount feedback (remove $, dollar, etc)
4. Update ONLY fields mentioned in feedback
5. Keep all other fields exactly the same

COMMON PATTERNS:
- "amount is 70" → amount: 70
- "amount 60" → amount: 60
- "make it 80 dollars" → amount: 80
- "payer is X" → payer: "X"
- "working hours is 5" → workingHours: 5

Return complete updated JSON in this format:
{
  "amount": <number>,
  "description": "<description>",
  "payer": "<payer>",
  "recipient": "<recipient>",
  "workingHours": <number or null>
}

Return ONLY JSON, no explanations.`;

  const resp = await client.chat.completions.create({
    model: "llama3.1-8b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Update: ${userFeedback}` }
    ],
    temperature: 0.1,
    max_tokens: 500
  });

  return resp.choices[0].message.content;
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/generate-invoice');
  console.log('  POST /api/upload-to-ipfs');
});