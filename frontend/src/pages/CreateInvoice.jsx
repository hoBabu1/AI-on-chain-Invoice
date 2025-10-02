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

  const MAX_ATTEMPTS = 5;
  const BACKEND_URL = 'http://localhost:3001';

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
        
        // Ensure amount is a number
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
        
        // Ensure amount is a number
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

    try {
      console.log('Uploading invoice to IPFS:', generatedInvoice);

      const response = await axios.post(`${BACKEND_URL}/api/upload-to-ipfs`, {
        invoiceData: generatedInvoice
      });

      console.log('IPFS response:', response.data);

      if (response.data.success) {
        const { tokenUri: uri, amount } = response.data;
        
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
    }
  };

  const mintNFT = async (uri, amount) => {
    setCurrentStep('minting');

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // Ensure amount is valid
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount: ${amount}`);
      }

      console.log('Starting minting process...');
      console.log('Token URI:', uri);
      console.log('Amount (raw):', amount);
      console.log('Amount type:', typeof amount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Convert amount to BigInt for wei
      const amountInWei = ethers.parseEther(amount.toString());
      
      console.log('Amount in wei:', amountInWei.toString());
      console.log('Calling contract.mintNft...');

      const tx = await contract.mintNft(uri, amountInWei);
      
      console.log('Transaction sent:', tx.hash);
      setTransactionHash(tx.hash);

      console.log('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      console.log('Transaction confirmed!', receipt);
      setCurrentStep('success');

    } catch (err) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint NFT');
      setCurrentStep('reviewing');
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
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Create Invoice NFT</h2>

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
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={!walletAddress || isProcessing || !invoiceText.trim()}
            >
              {isProcessing ? 'Generating...' : 'Generate Invoice'}
            </button>
          </form>
        </div>
      )}

      {currentStep === 'reviewing' && generatedInvoice && (
        <div className="form-box">
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
              {isProcessing ? 'Processing...' : 
               userFeedback.trim().toLowerCase() === 'ok' || userFeedback.trim().toLowerCase() === 'yes' 
                ? 'Approve & Mint' : 'Update Invoice'}
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

      {currentStep === 'uploading' && (
        <div className="form-box">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Uploading to IPFS...</h3>
            <div className="spinner"></div>
          </div>
        </div>
      )}

      {currentStep === 'minting' && (
        <div className="form-box">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Minting NFT...</h3>
            <p>Confirm transaction in MetaMask</p>
            {transactionHash && (
              <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                TX: {transactionHash}
              </p>
            )}
            <div className="spinner"></div>
          </div>
        </div>
      )}

      {currentStep === 'success' && (
        <div className="form-box">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#28a745', fontSize: '32px' }}>Success!</h3>
            <p>Invoice NFT minted successfully</p>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'left' }}>
              <p><strong>Token URI:</strong></p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>{tokenUri}</p>
              
              <p><strong>Transaction:</strong></p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>{transactionHash}</p>
              
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

      <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
}

export default CreateInvoice;