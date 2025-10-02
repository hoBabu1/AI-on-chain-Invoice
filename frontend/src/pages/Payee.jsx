import { useState } from 'react';
import { ethers } from 'ethers';

function Payee({ walletAddress }) {
  const [formData, setFormData] = useState({
    recipient: '',
    token: '',
    invoiceNumber: '',
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

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

    if (!formData.token || !ethers.isAddress(formData.token)) {
      alert('Please enter a valid token address!');
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

    try {
      // Here you would interact with your smart contract
      // This is a placeholder for the actual contract interaction
      
      const paymentData = {
        recipient: formData.recipient,
        token: formData.token,
        invoiceNumber: parseInt(formData.invoiceNumber),
        amount: formData.amount,
        sender: walletAddress,
        timestamp: new Date().toISOString()
      };

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, you would:
      // 1. Get contract instance
      // 2. Call payment function
      // 3. Wait for transaction confirmation
      
      console.log('Payment Data:', paymentData);
      
      setTransactionResult({
        ...paymentData,
        txHash: '0x' + Math.random().toString(16).substr(2, 64), // Mock transaction hash
        status: 'success'
      });

      alert('Payment processed successfully!');
      
      // Reset form
      setFormData({
        recipient: '',
        token: '',
        invoiceNumber: '',
        amount: ''
      });

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              disabled={!walletAddress}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Token Address
            </label>
            <input
              type="text"
              name="token"
              className="form-input"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="0x... (ERC20 token contract address)"
              disabled={!walletAddress}
            />
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
              disabled={!walletAddress}
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
              placeholder="e.g., 100.5"
              disabled={!walletAddress}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!walletAddress || isSubmitting}
          >
            {isSubmitting ? 'Processing Payment...' : 'Process Payment'}
          </button>
        </form>

        {transactionResult && (
          <div className="result-box">
            <h3 className="result-title">✅ Payment Successful!</h3>
            <div className="result-content">
              <strong>Transaction Hash:</strong> {transactionResult.txHash}
              <br />
              <strong>Recipient:</strong> {transactionResult.recipient}
              <br />
              <strong>Token:</strong> {transactionResult.token}
              <br />
              <strong>Invoice Number:</strong> {transactionResult.invoiceNumber}
              <br />
              <strong>Amount:</strong> {transactionResult.amount}
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