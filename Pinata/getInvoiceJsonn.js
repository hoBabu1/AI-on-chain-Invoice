// In another file
import { createInvoice } from '../AI/getInvoiceJson.js';

// Call the function
const invoiceJson = await createInvoice();

if (invoiceJson) {
  console.log('Got invoice:', invoiceJson);
  // Use the JSON structure as needed
  // invoiceJson will contain: date, recipient, payee, amount, workingHours, description, image
} else {
  console.log('Invoice creation failed');
}