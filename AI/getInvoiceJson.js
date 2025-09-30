import Cerebras from '@cerebras/cerebras_cloud_sdk';
import readline from 'readline';

const client = new Cerebras({
  apiKey: process.env['CEREBRAS_API_KEY'], // Replace with your actual Cerebras API key
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input
function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Function to check if user wants AI to calculate
async function shouldAIAssume(userInput) {
  const assumeKeywords = [
    'calculate yourself',
    'you calculate',
    'figure it out',
    'estimate',
    'you decide',
    'assume',
    'your own',
    'work it out',
    'determine',
    'guess'
  ];
  
  const lowerInput = userInput.toLowerCase();
  
  // First, check with simple keyword matching
  if (assumeKeywords.some(keyword => lowerInput.includes(keyword))) {
    return true;
  }
  
  // If no keywords found, ask AI to understand the intent
  try {
    const intentCheckPrompt = `Analyze if the user is asking you to calculate, estimate, or assume missing invoice details (like amount, rate, or payer).

User message: "${userInput}"

Respond with ONLY "YES" if they want you to make assumptions/calculations, or "NO" if they are providing all details explicitly.

Examples:
- "I did work, figure out the rate" -> YES
- "Built a website, not sure about pricing" -> YES  
- "Can you estimate the cost?" -> YES
- "I built a website for $5000 for Acme" -> NO
- "Completed the project for John, amount $2000" -> NO

Response (YES or NO):`;

    const resp = await client.chat.completions.create({
      model: "llama3.1-8b",
      messages: [
        { role: "user", content: intentCheckPrompt }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const aiDecision = resp.choices[0].message.content.trim().toUpperCase();
    return aiDecision.includes('YES');
    
  } catch (error) {
    console.log('Note: Using keyword-based detection due to API error');
    return false;
  }
}

// Function to generate invoice with AI
async function generateInvoice(userInvoice, allowAssumptions) {
  let systemPrompt;
  
  if (allowAssumptions) {
    systemPrompt = `You are an invoice processing assistant. Convert the user's natural language invoice description into a JSON format with the following structure:
{
  "amount": <number>,
  "description": "<description of work developer did>",
  "payer": "<who is going to pay>",
  "paymentStatus": "not paid",
  "assumedFields": ["list of fields you assumed"]
}

IMPORTANT INSTRUCTIONS:
1. Always set paymentStatus to "not paid" by default.
2. Extract the amount as a number (without currency symbols), the description of work done, and who will be paying.
3. You are ALLOWED to make intelligent assumptions for missing information:
   - If amount is missing: Estimate based on industry standard rates for the type of work described
   - If payer is missing: Set to null
   - If description is vague: Use the information provided but keep it concise
4. For developer work, use these industry standard hourly rates as reference:
   - Junior developer: $50-75/hour
   - Mid-level developer: $75-125/hour
   - Senior developer: $125-200/hour
   - Specialized work (AI/ML, blockchain): $150-250/hour
5. In the "assumedFields" array, list which fields you had to assume (e.g., ["amount", "payer"])
6. Return ONLY the JSON object, no additional text.`;
  } else {
    systemPrompt = `You are an invoice processing assistant. Convert the user's natural language invoice description into a JSON format with the following structure:
{
  "amount": <number>,
  "description": "<description of work developer did>",
  "payer": "<who is going to pay>",
  "paymentStatus": "not paid"
}

IMPORTANT INSTRUCTIONS:
1. Always set paymentStatus to "not paid" by default.
2. Extract ONLY the information explicitly provided by the user.
3. DO NOT make assumptions or estimates.
4. If critical information (amount, description, payer) is missing, set those fields to null.
5. Return ONLY the JSON object, no additional text.`;
  }

  const resp = await client.chat.completions.create({
    model: "llama3.1-8b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInvoice }
    ]
  });

  return resp.choices[0].message.content;
}

async function main() {
  console.log('=== Invoice Generator ===\n');
  
  let attempts = 0;
  const maxAttempts = 5;
  let isApproved = false;
  let invoiceData = null;
  
  // Get initial user input
  const userInvoice = await getUserInput('Write your invoice in normal English: ');
  
  // Check if user wants AI to assume/calculate
  const allowAssumptions = await shouldAIAssume(userInvoice);
  
  if (!allowAssumptions) {
    console.log('\nProcessing your invoice with provided information only...\n');
  } else {
    console.log('\nAI will make intelligent assumptions for missing details...\n');
  }
  
  while (attempts < maxAttempts && !isApproved) {
    attempts++;
    console.log(`\n--- Attempt ${attempts}/${maxAttempts} ---`);
    
    try {
      const aiResponse = await generateInvoice(userInvoice, allowAssumptions);
      
      // Parse the JSON
      try {
        invoiceData = JSON.parse(aiResponse);
        
        // Check for critical missing fields when assumptions not allowed
        if (!allowAssumptions) {
          const missingFields = [];
          if (!invoiceData.amount || invoiceData.amount === null || invoiceData.amount <= 0) {
            missingFields.push('amount');
          }
          if (!invoiceData.description || invoiceData.description === '') {
            missingFields.push('description');
          }
          if (!invoiceData.payer || invoiceData.payer === null) {
            missingFields.push('payer');
          }
          
          if (missingFields.length > 0) {
            console.error('\n❌ ERROR: Missing required invoice details!');
            console.error(`Missing fields: ${missingFields.join(', ')}`);
            console.error('\nPlease provide a complete invoice with:');
            console.error('- Amount (how much)');
            console.error('- Description (what work was done)');
            console.error('- Payer (who will pay)');
            console.error('\nOr say "you calculate yourself" to let AI estimate missing values.');
            rl.close();
            process.exit(1);
          }
        }
        
        // Validate amount
        if (invoiceData.amount && (isNaN(invoiceData.amount) || invoiceData.amount <= 0)) {
          console.error('\n❌ ERROR: Invalid amount. Amount must be a positive number.');
          rl.close();
          process.exit(1);
        }
        
        // Display the generated invoice
        console.log('\n=== Generated Invoice ===');
        console.log(JSON.stringify({
          amount: invoiceData.amount,
          description: invoiceData.description,
          payer: invoiceData.payer,
          paymentStatus: invoiceData.paymentStatus
        }, null, 2));
        
        // Show which fields were assumed
        if (allowAssumptions && invoiceData.assumedFields && invoiceData.assumedFields.length > 0) {
          console.log(`\n⚠️  AI assumed values for: ${invoiceData.assumedFields.join(', ')}`);
        }
        
        console.log('\n=== Invoice Details ===');
        console.log(`Amount: $${invoiceData.amount}`);
        console.log(`Description: ${invoiceData.description}`);
        console.log(`Payer: ${invoiceData.payer || 'Not specified'}`);
        console.log(`Payment Status: ${invoiceData.paymentStatus}`);
        
        // Ask for user confirmation
        const userResponse = await getUserInput('\nIs this okay? (yes/ok to proceed, or describe changes): ');
        const lowerResponse = userResponse.toLowerCase().trim();
        
        if (lowerResponse === 'yes' || lowerResponse === 'ok' || lowerResponse === 'y') {
          isApproved = true;
          console.log('\n✅ Invoice approved!\n');
          console.log('=== Final Invoice JSON for NFT ===');
          console.log(JSON.stringify({
            amount: invoiceData.amount,
            description: invoiceData.description,
            payer: invoiceData.payer,
            paymentStatus: invoiceData.paymentStatus
          }, null, 2));
        } else {
          if (attempts < maxAttempts) {
            console.log('\nGenerating updated invoice based on your feedback...');
            // Append user feedback to create new invoice
            const updatedInvoice = `${userInvoice}\n\nUser feedback: ${userResponse}`;
            // Re-generate with updated input
            const newAiResponse = await generateInvoice(updatedInvoice, allowAssumptions);
            // Continue loop with new response
            continue;
          } else {
            console.log('\n❌ Maximum attempts reached. Please try again with clearer details.');
          }
        }
        
      } catch (parseError) {
        console.error('\n❌ ERROR: Failed to parse invoice data.');
        console.error('The AI response was not in valid JSON format.');
        console.error('Raw AI response:', aiResponse);
        
        if (attempts >= maxAttempts) {
          rl.close();
          process.exit(1);
        }
      }
      
    } catch (error) {
      console.error('\n❌ API Error:', error.message);
      
      if (attempts >= maxAttempts) {
        rl.close();
        process.exit(1);
      }
    }
  }
  
  if (!isApproved) {
    console.log('\n❌ Invoice generation cancelled after maximum attempts.');
    rl.close();
    process.exit(1);
  }
  
  rl.close();
}

main();