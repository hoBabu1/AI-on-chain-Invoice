import Cerebras from '@cerebras/cerebras_cloud_sdk';
import readline from 'readline';

const client = new Cerebras({
  apiKey: process.env['CEREBRAS_API_KEY'], // Replace with your actual Cerebras API key
});

// Function to get user input
function getUserInput(prompt, rlInterface) {
  return new Promise((resolve) => {
    rlInterface.question(prompt, (answer) => {
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
  const systemPrompt = `You are an invoice processing assistant. Your ONLY job is to extract information and return valid JSON.

CRITICAL: Understand these roles clearly:
- RECIPIENT = The person who DID the work and will RECEIVE the payment
- PAYER = The person who WILL PAY for the work (the client/customer)

Example to understand:
"I am John, I built a website for Sarah" means:
- John did the work → John is RECIPIENT
- Sarah is the client → Sarah is PAYER

Another example:
"Aman fixed bugs for Anjali's website" means:
- Aman did the work → Aman is RECIPIENT  
- Anjali is the client → Anjali is PAYER

Return JSON in this EXACT format:
{
  "amount": <number or null>,
  "description": "<description of work>",
  "payer": "<person who will pay (the client)>",
  "recipient": "<person who did the work>",
  "workingHours": <number or null>
}

EXTRACTION RULES:
1. RECIPIENT: Look for "I am X", "my name is X", "X did the work", "X fixed/built/created"
2. PAYER: Look for "for Y", "Y's project", "client is Y"  
3. AMOUNT: Extract numbers mentioned as payment (remove $ or currency symbols)
4. WORKING HOURS: Extract if mentioned (e.g., "4 hours", "worked 5 hours")
5. DESCRIPTION: What work was done (keep it brief)

${allowAssumptions ? `
ASSUMPTION MODE ENABLED:
- If amount is missing: Estimate based on work type and hours
- Use developer rates: Junior ($50-75/hr), Mid ($75-125/hr), Senior ($125-200/hr)
- If payer/recipient missing: Set to null
` : `
STRICT MODE:
- Extract ONLY information explicitly provided
- If any field is not mentioned, set it to null
- Do NOT estimate or assume anything
`}

RESPONSE REQUIREMENTS:
- Return ONLY the JSON object
- No explanations, no additional text
- Ensure valid JSON syntax
- Use null for missing values (not "null" as string)`;

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

// Function to handle invoice updates based on user feedback
async function updateInvoice(currentInvoice, userFeedback) {
  const systemPrompt = `You are updating an existing invoice based on user feedback.

CURRENT INVOICE DATA:
${JSON.stringify(currentInvoice, null, 2)}

USER FEEDBACK: "${userFeedback}"

YOUR TASK:
1. Read the current invoice data above
2. Identify what the user wants to change from their feedback
3. Update ONLY the fields mentioned in the feedback
4. Keep all other fields EXACTLY as they are in the current invoice
5. Return the complete updated invoice JSON

COMMON FEEDBACK PATTERNS:
- "amount is 50" or "keep amount 50" or "make amount 60" → Update amount to that number
- "working hours is 3" → Update workingHours to 3
- "payer is X" → Update payer to X (person who pays)
- "recipient is Y" → Update recipient to Y (person who receives payment)
- "description is ..." → Update description

CRITICAL RULES:
- Extract the EXACT values from user feedback (don't calculate or estimate)
- If user says "amount 60" or "amount to 60" or "keep amount 60", use 60
- Do NOT swap payer and recipient values
- Do NOT change fields that aren't mentioned in the feedback
- Return ONLY the JSON object, no explanations

Return the updated invoice in this format:
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
      { role: "user", content: `Update the invoice based on this feedback: ${userFeedback}` }
    ],
    temperature: 0.1,
    max_tokens: 500
  });

  return resp.choices[0].message.content;
}

// Main function that can be called from other files
export async function createInvoice() {
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log('=== Invoice Generator ===\n');
    
    let attempts = 0;
    const maxAttempts = 5;
    let isApproved = false;
    let invoiceData = null;
    let userFeedback = '';
    
    // Get initial user input - everything in one go
    const userInvoice = await getUserInput('Write your invoice in normal English: ', rl);
    
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
        let aiResponse;
        
        if (attempts === 1) {
          // First attempt: generate from user input
          aiResponse = await generateInvoice(userInvoice, allowAssumptions);
        } else {
          // Subsequent attempts: update based on feedback
          aiResponse = await updateInvoice(invoiceData, userFeedback);
        }
        
        // Parse the JSON
        try {
          const parsedData = JSON.parse(aiResponse);
          invoiceData = parsedData;
          
          // Check for critical missing fields when assumptions not allowed
          if (!allowAssumptions && attempts === 1) {
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
              return null;
            }
          }
          
          // Validate amount
          if (invoiceData.amount && (isNaN(invoiceData.amount) || invoiceData.amount <= 0)) {
            console.error('\n❌ ERROR: Invalid amount. Amount must be a positive number.');
            rl.close();
            return null;
          }
          
          // Display the generated invoice
          console.log('\n=== Generated Invoice ===');
          console.log(JSON.stringify({
            amount: invoiceData.amount,
            description: invoiceData.description,
            payer: invoiceData.payer,
            recipient: invoiceData.recipient,
            workingHours: invoiceData.workingHours
          }, null, 2));
          
          // Show which fields were assumed (only for first attempt with assumptions)
          if (allowAssumptions && attempts === 1 && invoiceData.assumedFields && invoiceData.assumedFields.length > 0) {
            console.log(`\n⚠️  AI assumed values for: ${invoiceData.assumedFields.join(', ')}`);
          }
          
          console.log('\n=== Invoice Details ===');
          console.log(`Amount: $${invoiceData.amount}`);
          console.log(`Description: ${invoiceData.description}`);
          console.log(`Payer: ${invoiceData.payer || 'Not specified'}`);
          console.log(`Recipient: ${invoiceData.recipient || 'Not specified'}`);
          console.log(`Working Hours: ${invoiceData.workingHours || 'Not specified'}`);
          
          // Ask for user confirmation
          const userResponse = await getUserInput('\nIs this okay? (yes/ok to proceed, or describe changes): ', rl);
          const lowerResponse = userResponse.toLowerCase().trim();
          
          if (lowerResponse === 'yes' || lowerResponse === 'ok' || lowerResponse === 'y') {
            isApproved = true;
            console.log('\n✅ Invoice approved!\n');
            
            // Generate current date in ISO format
            const generatedDate = new Date().toISOString();
            
            const finalInvoice = {
              date: generatedDate,
              recipient: invoiceData.recipient,
              payee: invoiceData.payer,
              amount: invoiceData.amount,
              workingHours: invoiceData.workingHours,
              description: invoiceData.description,
              image: "https://ipfs.io/ipfs/bafkreiajzvukrl7agyfngjjhrstqcm3trwer66woe6zweoksdwuvcv6czy"
            };
            
            console.log('=== Final Invoice JSON for NFT ===');
            console.log(JSON.stringify(finalInvoice, null, 2));
            
            rl.close();
            return finalInvoice;
          } else {
            if (attempts < maxAttempts) {
              console.log('\nGenerating updated invoice based on your feedback...');
              userFeedback = userResponse;
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
            return null;
          }
        }
        
      } catch (error) {
        console.error('\n❌ API Error:', error.message);
        
        if (attempts >= maxAttempts) {
          rl.close();
          return null;
        }
      }
    }
    
    if (!isApproved) {
      console.log('\n❌ Invoice generation cancelled after maximum attempts.');
      rl.close();
      return null;
    }
    
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  createInvoice().then(result => {
    if (result) {
      console.log('\n✅ Invoice creation successful!');
    } else {
      console.log('\n❌ Invoice creation failed.');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}