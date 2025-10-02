// frontend/pages/api/generate-invoice.js
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
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
    const intentCheckPrompt = `Analyze if the user is asking you to calculate, estimate, or assume missing invoice details (like amount, rate, or payer).

User message: "${userInput}"

Respond with ONLY "YES" if they want you to make assumptions/calculations, or "NO" if they are providing all details explicitly.

Response (YES or NO):`;

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
  const systemPrompt = `You are an invoice processing assistant. Your ONLY job is to extract information and return valid JSON.

CRITICAL: Understand these roles clearly:
- RECIPIENT = The person who DID the work and will RECEIVE the payment
- PAYER = The person who WILL PAY for the work (the client/customer)

Return JSON in this EXACT format:
{
  "amount": <number or null>,
  "description": "<description of work>",
  "payer": "<person who will pay (the client)>",
  "recipient": "<person who did the work>",
  "workingHours": <number or null>
}

EXTRACTION RULES:
1. RECIPIENT: Look for "I am X", "my name is X", "X did the work"
2. PAYER: Look for "for Y", "Y's project", "client is Y"  
3. AMOUNT: Extract numbers mentioned as payment (remove $ or currency symbols)
4. WORKING HOURS: Extract if mentioned
5. DESCRIPTION: What work was done (keep it brief)

${allowAssumptions ? `
ASSUMPTION MODE ENABLED:
- If amount is missing: Estimate based on work type and hours
- Use developer rates: Junior ($50-75/hr), Mid ($75-125/hr), Senior ($125-200/hr)
` : `
STRICT MODE:
- Extract ONLY information explicitly provided
- If any field is not mentioned, set it to null
`}

RESPONSE REQUIREMENTS:
- Return ONLY the JSON object
- No explanations
- Use null for missing values`;

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
  const systemPrompt = `You are updating an existing invoice based on user feedback.

CURRENT INVOICE DATA:
${JSON.stringify(currentInvoice, null, 2)}

USER FEEDBACK: "${userFeedback}"

Update ONLY the fields mentioned in feedback. Return complete updated JSON in this format:
{
  "amount": <number or null>,
  "description": "<description>",
  "payer": "<person who pays>",
  "recipient": "<person who receives>",
  "workingHours": <number or null>
}`;

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, userInvoice, currentInvoice, userFeedback } = req.body;

    if (action === 'generate') {
      const allowAssumptions = await shouldAIAssume(userInvoice);
      const aiResponse = await generateInvoice(userInvoice, allowAssumptions);
      const parsedData = JSON.parse(aiResponse);

      if (!allowAssumptions) {
        const missingFields = [];
        if (!parsedData.amount || parsedData.amount <= 0) missingFields.push('amount');
        if (!parsedData.description) missingFields.push('description');
        if (!parsedData.payer) missingFields.push('payer');

        if (missingFields.length > 0) {
          return res.status(400).json({
            error: 'Missing required fields',
            missingFields
          });
        }
      }

      if (parsedData.amount && (isNaN(parsedData.amount) || parsedData.amount <= 0)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      return res.status(200).json({ success: true, invoice: parsedData });

    } else if (action === 'update') {
      const aiResponse = await updateInvoice(currentInvoice, userFeedback);
      const parsedData = JSON.parse(aiResponse);
      return res.status(200).json({ success: true, invoice: parsedData });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}