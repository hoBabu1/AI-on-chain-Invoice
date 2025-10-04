import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI , USDT_TOKEN_ADDRESS} from '../config/contract';

// Standard ERC20 ABI (only the functions we need)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)"
];

const TOKEN_ADDRESS = USDT_TOKEN_ADDRESS;

function Payee({ walletAddress }) {
  const [formData, setFormData] = useState({
    recipient: '',
    invoiceNumber: '',
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return false;
    }

    if (!formData.recipient || !ethers.isAddress(formData.recipient)) {
      alert('Please enter a valid recipient address!');
      return false;
    }

    if (!formData.invoiceNumber || isNaN(formData.invoiceNumber)) {
      alert('Please enter a valid invoice number!');
      return false;
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setTransactionResult(null);

    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Convert amount to wei (multiply by 10^18)
      const amountInWei = ethers.parseUnits(formData.amount, 18);

      // Step 1: Approve token spending
      setCurrentStep('Approving token spending...');
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountInWei);
      console.log('Approval transaction sent:', approveTx.hash);
      
      await approveTx.wait();
      console.log('Approval confirmed');

      // Step 2: Call paymentOfInvoice function
      setCurrentStep('Processing payment...');
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const paymentTx = await nftContract.paymentOfInvoice(
        formData.recipient,
        TOKEN_ADDRESS,
        parseInt(formData.invoiceNumber),
        amountInWei
      );
      
      console.log('Payment transaction sent:', paymentTx.hash);
      
      const receipt = await paymentTx.wait();
      console.log('Payment confirmed:', receipt);

      setTransactionResult({
        recipient: formData.recipient,
        token: TOKEN_ADDRESS,
        invoiceNumber: parseInt(formData.invoiceNumber),
        amount: formData.amount,
        amountInWei: amountInWei.toString(),
        sender: walletAddress,
        txHash: paymentTx.hash,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      alert('Payment processed successfully!');
      
      // Reset form
      setFormData({
        recipient: '',
        invoiceNumber: '',
        amount: ''
      });

    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Payee - Process Payment</h2>
      
      {!walletAddress && (
        <div className="alert alert-warning">
          ⚠️ Please connect your MetaMask wallet to process payment
        </div>
      )}

      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Recipient Address
            </label>
            <input
              type="text"
              name="recipient"
              className="form-input"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="0x..."
              disabled={!walletAddress || isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Token Address
            </label>
            <input
              type="text"
              className="form-input"
              value={TOKEN_ADDRESS}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Token address is fixed</small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Invoice Number
            </label>
            <input
              type="number"
              name="invoiceNumber"
              className="form-input"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              placeholder="e.g., 12345"
              disabled={!walletAddress || isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Amount (in tokens)
            </label>
            <input
              type="text"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="e.g., 70"
              disabled={!walletAddress || isSubmitting}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              {formData.amount && !isNaN(formData.amount) && `Will be converted to: ${formData.amount}e18 wei`}
            </small>
          </div>

          {currentStep && (
            <div className="alert alert-info" style={{ marginBottom: '15px' }}>
              ⏳ {currentStep}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={!walletAddress || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Process Payment'}
          </button>
        </form>

        {transactionResult && (
          <div className="result-box">
            <h3 className="result-title">✅ Payment Successful!</h3>
            <div className="result-content">
              <strong>Transaction Hash:</strong> 
              <a 
                href={`https://etherscan.io/tx/${transactionResult.txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#4CAF50', marginLeft: '5px' }}
              >
                {transactionResult.txHash}
              </a>
              <br />
              <strong>Recipient:</strong> {transactionResult.recipient}
              <br />
              <strong>Token:</strong> {transactionResult.token}
              <br />
              <strong>Invoice Number:</strong> {transactionResult.invoiceNumber}
              <br />
              <strong>Amount:</strong> {transactionResult.amount} tokens
              <br />
              <strong>Amount (Wei):</strong> {transactionResult.amountInWei}
              <br />
              <strong>Sender:</strong> {transactionResult.sender}
              <br />
              <strong>Timestamp:</strong> {new Date(transactionResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payee;