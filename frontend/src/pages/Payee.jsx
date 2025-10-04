import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_TOKEN_ADDRESS } from '../config/contract';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  const PAYMENT_STEPS = [
    { id: 1, label: 'Preparing Payment', emoji: '📝' },
    { id: 2, label: 'Approving Token', emoji: '🔓' },
    { id: 3, label: 'Token Approved', emoji: '✅' },
    { id: 4, label: 'Waiting for MetaMask', emoji: '🦊' },
    { id: 5, label: 'Payment Sent', emoji: '📤' },
    { id: 6, label: 'Mining Transaction', emoji: '⛏️' },
    { id: 7, label: 'Payment Complete', emoji: '🎉' }
  ];

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
    setCurrentStep(0);
    setTxHash('');

    try {
      // Step 1: Preparing
      setCurrentStep(1);
      setStatusMessage('Preparing payment transaction...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const amountInWei = ethers.parseUnits(formData.amount, 18);

      // Step 2: Approving Token
      setCurrentStep(2);
      setStatusMessage('Approving USDT token spending...');
      
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountInWei);
      
      console.log('Approval transaction sent:', approveTx.hash);
      
      await approveTx.wait();
      console.log('Approval confirmed');

      // Step 3: Token Approved
      setCurrentStep(3);
      setStatusMessage('Token approved successfully!');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: Waiting for MetaMask
      setCurrentStep(4);
      setStatusMessage('Please confirm payment in MetaMask...');
      
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const paymentTx = await nftContract.paymentOfInvoice(
        formData.recipient,
        TOKEN_ADDRESS,
        parseInt(formData.invoiceNumber),
        amountInWei
      );
      
      // Step 5: Payment Sent
      setCurrentStep(5);
      setStatusMessage(`Payment sent! Hash: ${paymentTx.hash.substring(0, 10)}...`);
      setTxHash(paymentTx.hash);
      
      console.log('Payment transaction sent:', paymentTx.hash);

      // Step 6: Mining
      setCurrentStep(6);
      setStatusMessage('Waiting for blockchain confirmation...');

      const receipt = await paymentTx.wait();
      
      // Step 7: Complete
      setCurrentStep(7);
      setStatusMessage('Payment completed successfully! 🎉');
      
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
        status: 'success',
        blockNumber: receipt.blockNumber
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormData({
        recipient: '',
        invoiceNumber: '',
        amount: ''
      });

    } catch (error) {
      console.error('Payment error:', error);
      
      setCurrentStep(0);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user.';
        setStatusMessage('❌ Transaction rejected');
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
        setStatusMessage(`❌ Error: ${error.message}`);
      } else {
        setStatusMessage('❌ Payment failed');
      }
      
      alert(errorMessage);
      
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      recipient: '',
      invoiceNumber: '',
      amount: ''
    });
    setTransactionResult(null);
    setCurrentStep(0);
    setStatusMessage('');
    setTxHash('');
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Payee - Process Payment</h2>
      
      {!walletAddress && (
        <div className="alert alert-warning">
          ⚠️ Please connect your MetaMask wallet to process payment
        </div>
      )}

      {currentStep === 0 && !transactionResult && (
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
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                The address that will receive the payment
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Token Address (USDT)
              </label>
              <input
                type="text"
                className="form-input"
                value={TOKEN_ADDRESS}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                Token address is fixed to USDT
              </small>
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
                placeholder="e.g., 0, 1, 2..."
                disabled={!walletAddress || isSubmitting}
              />
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                The NFT token ID of the invoice
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Amount (in USDT)
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
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                {formData.amount && !isNaN(formData.amount) && `Will be converted to: ${formData.amount}e18 wei`}
              </small>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={!walletAddress || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : '💳 Process Payment'}
            </button>
          </form>
        </div>
      )}

      {isSubmitting && currentStep > 0 && (
        <div className="form-box">
          <div className="progress-container">
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
              {currentStep < 4 ? '🔓 Approving Token' : '💰 Processing Payment'}
            </h3>
            
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(currentStep / PAYMENT_STEPS.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="steps-grid">
              {PAYMENT_STEPS.map((step) => (
                <div 
                  key={step.id} 
                  className={`step-item-grid ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                >
                  <div className="step-circle-grid">
                    {currentStep > step.id ? '✓' : step.emoji}
                  </div>
                  <div className="step-label-grid">{step.label}</div>
                </div>
              ))}
            </div>
            
            <div className="status-message">
              {statusMessage}
            </div>

            {txHash && currentStep >= 5 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '1rem',
                fontSize: '0.85rem',
                wordBreak: 'break-all',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.5rem',
                borderRadius: '5px'
              }}>
                <strong>TX Hash:</strong> {txHash}
              </div>
            )}
          </div>
        </div>
      )}

      {transactionResult && currentStep === 7 && (
        <div className="form-box">
          <div style={{ textAlign: 'center', padding: '40px' }} className="success-animation-box">
            <div className="success-checkmark">✓</div>
            <h3 style={{ color: '#28a745', fontSize: '32px', marginTop: '1rem' }}>Payment Successful!</h3>
            <p style={{ fontSize: '18px', margin: '1rem 0' }}>Invoice payment completed</p>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'left' }}>
              <p><strong>Transaction Hash:</strong></p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>
                <a 
                  href={`https://amoy.polygonscan.com/tx/${transactionResult.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#667eea' }}
                >
                  {transactionResult.txHash}
                </a>
              </p>
              
              <p><strong>Recipient:</strong></p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>
                {transactionResult.recipient}
              </p>
              
              <p><strong>Invoice Number:</strong> {transactionResult.invoiceNumber}</p>
              <p><strong>Amount:</strong> {transactionResult.amount} USDT</p>
              <p><strong>Block Number:</strong> {transactionResult.blockNumber}</p>
              <p><strong>Timestamp:</strong> {new Date(transactionResult.timestamp).toLocaleString()}</p>
            </div>

            <button
              className="submit-btn"
              onClick={handleReset}
              style={{ marginTop: '20px' }}
            >
              Make Another Payment
            </button>
          </div>
        </div>
      )}

      <style>{`
        .progress-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 2rem;
          margin: 2rem 0;
          color: white;
        }

        .progress-bar-wrapper {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          height: 12px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .progress-bar-fill {
          background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
          height: 100%;
          transition: width 0.5s ease;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .step-item-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .step-item-grid.active {
          opacity: 1;
          transform: scale(1.1);
        }

        .step-item-grid.completed {
          opacity: 0.7;
        }

        .step-circle-grid {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .step-item-grid.active .step-circle-grid {
          background: rgba(255, 255, 255, 0.4);
          border-color: white;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          animation: pulse 1.5s infinite;
        }

        .step-item-grid.completed .step-circle-grid {
          background: #22c55e;
          border-color: #22c55e;
        }

        .step-label-grid {
          font-size: 0.7rem;
          text-align: center;
          font-weight: 500;
          line-height: 1.2;
        }

        .status-message {
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          animation: fadeIn 0.5s ease;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-animation-box {
          animation: successBounce 0.6s ease;
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #28a745;
          color: white;
          font-size: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          animation: checkmarkPop 0.6s ease;
          box-shadow: 0 0 30px rgba(40, 167, 69, 0.5);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes successBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes checkmarkPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .alert-warning {
          background-color: #fff3cd;
          color: #856404;
        }

        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .step-circle-grid {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .step-label-grid {
            font-size: 0.65rem;
          }

          .progress-container {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .step-circle-grid {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }

          .step-label-grid {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Payee;