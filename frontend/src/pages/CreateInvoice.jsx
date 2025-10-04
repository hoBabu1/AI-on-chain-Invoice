import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

function CreateInvoice({ walletAddress }) {
  const [invoiceText, setInvoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('input');
  const [attempts, setAttempts] = useState(0);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [userFeedback, setUserFeedback] = useState('');
  const [tokenUri, setTokenUri] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  
  // Progress tracking
  const [mintingStep, setMintingStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const MAX_ATTEMPTS = 5;
  const BACKEND_URL = 'https://ai-on-chain-invoice.onrender.com';

  const MINTING_STEPS = [
    { id: 1, label: 'AI Processing Invoice', emoji: '🤖' },
    { id: 2, label: 'Uploading to IPFS', emoji: '📤' },
    { id: 3, label: 'IPFS Upload Complete', emoji: '✅' },
    { id: 4, label: 'Preparing NFT Mint', emoji: '📝' },
    { id: 5, label: 'Waiting for MetaMask', emoji: '🦊' },
    { id: 6, label: 'Transaction Sent', emoji: '🚀' },
    { id: 7, label: 'Mining on Blockchain', emoji: '⛏️' },
    { id: 8, label: 'NFT Minted Successfully', emoji: '🎉' }
  ];

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!invoiceText.trim()) {
      alert('Please enter invoice details!');
      return;
    }

    setIsProcessing(true);
    setError('');
    setAttempts(1);
    setCurrentStep('reviewing');

    try {
      console.log('Sending to backend:', invoiceText);

      const response = await axios.post(`${BACKEND_URL}/api/generate-invoice`, {
        action: 'generate',
        userInvoice: invoiceText
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        const invoice = response.data.invoice;
        
        if (invoice.amount) {
          invoice.amount = parseFloat(invoice.amount);
        }

        console.log('Parsed invoice:', invoice);
        setGeneratedInvoice(invoice);
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate invoice');
      setCurrentStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!userFeedback.trim()) {
      alert('Please provide feedback');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      alert('Maximum attempts reached');
      return;
    }

    setIsProcessing(true);
    setError('');
    setAttempts(prev => prev + 1);

    try {
      console.log('Updating with feedback:', userFeedback);
      console.log('Current invoice:', generatedInvoice);

      const response = await axios.post(`${BACKEND_URL}/api/generate-invoice`, {
        action: 'update',
        currentInvoice: generatedInvoice,
        userFeedback: userFeedback
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        const invoice = response.data.invoice;
        
        if (invoice.amount) {
          invoice.amount = parseFloat(invoice.amount);
        }

        console.log('Updated invoice:', invoice);
        setGeneratedInvoice(invoice);
        setUserFeedback('');
      }

    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveInvoice = async () => {
    setIsProcessing(true);
    setError('');
    setCurrentStep('uploading');
    setMintingStep(0);

    try {
      // Step 1: AI Processing
      setMintingStep(1);
      setStatusMessage('AI has processed your invoice successfully!');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Uploading to IPFS
      setMintingStep(2);
      setStatusMessage('Uploading invoice data to IPFS...');
      
      console.log('Uploading invoice to IPFS:', generatedInvoice);

      const response = await axios.post(`${BACKEND_URL}/api/upload-to-ipfs`, {
        invoiceData: generatedInvoice
      });

      console.log('IPFS response:', response.data);

      if (response.data.success) {
        const { tokenUri: uri, amount } = response.data;
        
        // Step 3: IPFS Complete
        setMintingStep(3);
        setStatusMessage(`IPFS upload complete! CID: ${uri.split('/').pop()}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Token URI:', uri);
        console.log('Amount:', amount);

        setTokenUri(uri);
        await mintNFT(uri, amount);
      }

    } catch (err) {
      console.error('IPFS error:', err);
      setError('Failed to upload to IPFS');
      setCurrentStep('reviewing');
      setIsProcessing(false);
      setMintingStep(0);
    }
  };

  const mintNFT = async (uri, amount) => {
    setCurrentStep('minting');

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount: ${amount}`);
      }

      // Step 4: Preparing
      setMintingStep(4);
      setStatusMessage('Preparing NFT mint transaction...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Starting minting process...');
      console.log('Token URI:', uri);
      console.log('Amount:', amount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amountInWei = ethers.parseEther(amount.toString());
      
      console.log('Amount in wei:', amountInWei.toString());

      // Step 5: Waiting for MetaMask
      setMintingStep(5);
      setStatusMessage('Please confirm transaction in MetaMask...');

      const tx = await contract.mintNft(uri, amountInWei);
      
      // Step 6: Transaction Sent
      setMintingStep(6);
      setStatusMessage(`Transaction sent! Hash: ${tx.hash.substring(0, 10)}...`);
      setTransactionHash(tx.hash);
      
      console.log('Transaction sent:', tx.hash);

      // Step 7: Mining
      setMintingStep(7);
      setStatusMessage('Waiting for blockchain confirmation...');

      const receipt = await tx.wait();
      
      // Step 8: Complete
      setMintingStep(8);
      setStatusMessage('NFT minted successfully! 🎉');
      
      console.log('Transaction confirmed!', receipt);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('success');

    } catch (err) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint NFT');
      setCurrentStep('reviewing');
      setMintingStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setInvoiceText('');
    setGeneratedInvoice(null);
    setUserFeedback('');
    setTokenUri('');
    setTransactionHash('');
    setError('');
    setAttempts(0);
    setCurrentStep('input');
    setMintingStep(0);
    setStatusMessage('');
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Create Invoice NFT</h2>

      {/* Cerebras Branding Banner */}
      <div className="cerebras-banner">
        <div className="cerebras-content">
          <span className="cerebras-icon">🧠</span>
          <span className="cerebras-text">
            Powered by{' '}
            <a 
              href="https://www.cerebras.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cerebras-link"
            >
              Cerebras AI
            </a>
            {' '}for intelligent invoice generation
          </span>
        </div>
      </div>

      {!walletAddress && (
        <div className="alert alert-warning">
          Please connect your MetaMask wallet
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {currentStep === 'input' && (
        <div className="form-box">
          <form onSubmit={handleGenerateInvoice}>
            <div className="form-group">
              <label className="form-label">
                Invoice Details (in normal English)
              </label>
              <textarea
                className="form-textarea"
                value={invoiceText}
                onChange={(e) => setInvoiceText(e.target.value)}
                placeholder="Example: I am Aman, did work for Aniket for 50 dollars, made his headphone."
                disabled={!walletAddress || isProcessing}
                style={{ minHeight: '150px' }}
              />
              <button
                type="button"
                onClick={() => setInvoiceText("I am John, did web development work for Alice for 100 dollars, worked 8 hours on her portfolio website")}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
                disabled={!walletAddress || isProcessing}
              >
                📝 Try Demo Data
              </button>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={!walletAddress || isProcessing || !invoiceText.trim()}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Cerebras AI is generating...
                </>
              ) : (
                '🤖 Generate Invoice with Cerebras AI'
              )}
            </button>
          </form>
        </div>
      )}

      {currentStep === 'reviewing' && generatedInvoice && (
        <div className="form-box">
          {/* Cerebras Success Badge */}
          <div className="cerebras-success-badge">
            <span className="success-icon">✨</span>
            <span>Generated by{' '}
              <a 
                href="https://www.cerebras.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cerebras-link-inline"
              >
                Cerebras AI
              </a>
            </span>
          </div>

          <h3 className="result-title">
            Generated Invoice (Attempt {attempts}/{MAX_ATTEMPTS})
          </h3>

          <div className="result-content" style={{ marginBottom: '20px' }}>
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
              <p><strong>Amount:</strong> ${generatedInvoice.amount}</p>
              <p><strong>Description:</strong> {generatedInvoice.description}</p>
              <p><strong>Payer:</strong> {generatedInvoice.payer || 'Not specified'}</p>
              <p><strong>Recipient:</strong> {generatedInvoice.recipient || 'Not specified'}</p>
              <p><strong>Working Hours:</strong> {generatedInvoice.workingHours || 'Not specified'}</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Type "ok" to approve, or describe changes:
            </label>
            <textarea
              className="form-textarea"
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              placeholder="Examples:&#10;- ok&#10;- amount is 70&#10;- make amount 60 dollars&#10;- payer is John"
              disabled={isProcessing}
              style={{ minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="submit-btn"
              onClick={() => {
                const feedback = userFeedback.trim().toLowerCase();
                if (feedback === 'ok' || feedback === 'yes') {
                  handleApproveInvoice();
                } else {
                  handleUpdateInvoice();
                }
              }}
              disabled={isProcessing || !userFeedback.trim()}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Cerebras AI is updating...
                </>
              ) : userFeedback.trim().toLowerCase() === 'ok' || userFeedback.trim().toLowerCase() === 'yes' 
                ? 'Approve & Mint' : '🔄 Update with Cerebras AI'}
            </button>

            <button
              className="submit-btn"
              onClick={handleReset}
              disabled={isProcessing}
              style={{ background: '#6c757d' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(currentStep === 'uploading' || currentStep === 'minting') && mintingStep > 0 && (
        <div className="form-box">
          <div className="progress-container">
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
              {mintingStep < 4 ? '📤 Uploading to IPFS' : '🎨 Minting NFT'}
            </h3>
            
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(mintingStep / MINTING_STEPS.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="steps-grid">
              {MINTING_STEPS.map((step) => (
                <div 
                  key={step.id} 
                  className={`step-item-grid ${mintingStep >= step.id ? 'active' : ''} ${mintingStep > step.id ? 'completed' : ''}`}
                >
                  <div className="step-circle-grid">
                    {mintingStep > step.id ? '✓' : step.emoji}
                  </div>
                  <div className="step-label-grid">{step.label}</div>
                </div>
              ))}
            </div>
            
            <div className="status-message">
              {statusMessage}
            </div>

            {transactionHash && mintingStep >= 6 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '1rem',
                fontSize: '0.85rem',
                wordBreak: 'break-all',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.5rem',
                borderRadius: '5px'
              }}>
                <strong>TX Hash:</strong> {transactionHash}
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 'success' && (
        <div className="form-box">
          <div style={{ textAlign: 'center', padding: '40px' }} className="success-animation-box">
            <div className="success-checkmark">✓</div>
            <h3 style={{ color: '#28a745', fontSize: '32px', marginTop: '1rem' }}>Success!</h3>
            <p style={{ fontSize: '18px', margin: '1rem 0' }}>Invoice NFT minted successfully</p>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'left' }}>
              <p><strong>Token URI:</strong></p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>
                <a href={tokenUri} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                  {tokenUri}
                </a>
              </p>
              
              <p><strong>Transaction:</strong></p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>
                <a 
                  href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#667eea' }}
                >
                  {transactionHash}
                </a>
              </p>
              
              <p><strong>Amount:</strong> ${generatedInvoice?.amount}</p>
            </div>

            <button
              className="submit-btn"
              onClick={handleReset}
              style={{ marginTop: '20px' }}
            >
              Create Another Invoice
            </button>
          </div>
        </div>
      )}

      <style>{`
        .cerebras-banner {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          border: 2px solid #0f3460;
          box-shadow: 0 4px 15px rgba(15, 52, 96, 0.3);
        }

        .cerebras-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .cerebras-icon {
          font-size: 1.5rem;
          animation: brainPulse 2s infinite;
        }

        .cerebras-text {
          color: #e0e0e0;
          font-size: 1rem;
          font-weight: 500;
        }

        .cerebras-link {
          color: #4ade80;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }

        .cerebras-link:hover {
          color: #22c55e;
          border-bottom-color: #22c55e;
        }

        .cerebras-success-badge {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          animation: slideDown 0.5s ease;
        }

        .success-icon {
          font-size: 1.2rem;
          animation: sparkle 1.5s infinite;
        }

        .cerebras-link-inline {
          color: #fef3c7;
          text-decoration: none;
          font-weight: 700;
          border-bottom: 2px solid #fef3c7;
          transition: all 0.3s ease;
        }

        .cerebras-link-inline:hover {
          color: #fff;
          border-bottom-color: #fff;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 0.5rem;
          vertical-align: middle;
        }

        @keyframes brainPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

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

        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
        }

        @media (max-width: 768px) {
          .cerebras-banner {
            padding: 0.75rem 1rem;
          }

          .cerebras-text {
            font-size: 0.9rem;
          }

          .cerebras-icon {
            font-size: 1.2rem;
          }

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
          .cerebras-content {
            flex-direction: column;
            gap: 0.5rem;
          }

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

export default CreateInvoice;