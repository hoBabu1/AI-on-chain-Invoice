import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, POLYGON_NETWORK } from '../config/contract';

function Register({ walletAddress }) {
  const [portfolioWebsite, setPortfolioWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  
  // Progress states
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const REGISTRATION_STEPS = [
    { id: 1, label: 'Preparing Transaction', emoji: '📝' },
    { id: 2, label: 'Waiting for MetaMask', emoji: '🦊' },
    { id: 3, label: 'Transaction Sent', emoji: '📤' },
    { id: 4, label: 'Mining on Blockchain', emoji: '⛏️' },
    { id: 5, label: 'Registration Complete', emoji: '✅' }
  ];

  useEffect(() => {
    checkNetwork();
  }, [walletAddress]);

  const checkNetwork = async () => {
    if (!window.ethereum || !walletAddress) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === POLYGON_NETWORK.chainId);
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const switchToPolygon = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_NETWORK.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_NETWORK],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error('Error adding Polygon network:', addError);
          alert('Failed to add Polygon network to MetaMask');
        }
      } else {
        console.error('Error switching to Polygon:', switchError);
        alert('Failed to switch to Polygon network');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!isCorrectNetwork) {
      alert('Please switch to Polygon network first!');
      return;
    }

    if (!portfolioWebsite.trim()) {
      alert('Please enter your portfolio website!');
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(0);
    setRegistrationData(null);
    setTxHash('');

    try {
      // Step 1: Preparing
      setCurrentStep(1);
      setStatusMessage('Preparing your registration...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Step 2: Waiting for MetaMask
      setCurrentStep(2);
      setStatusMessage('Please confirm transaction in MetaMask...');
      
      console.log('Calling registerUser function...');
      console.log('Portfolio Website:', portfolioWebsite);
      console.log('User Address:', walletAddress);

      const tx = await contract.registerUser(portfolioWebsite);
      
      // Step 3: Transaction Sent
      setCurrentStep(3);
      setStatusMessage(`Transaction sent! Hash: ${tx.hash.substring(0, 10)}...`);
      setTxHash(tx.hash);
      
      console.log('Transaction sent:', tx.hash);

      // Step 4: Mining
      setCurrentStep(4);
      setStatusMessage('Waiting for blockchain confirmation...');

      const receipt = await tx.wait();
      
      // Step 5: Complete
      setCurrentStep(5);
      setStatusMessage('Registration successful! 🎉');
      
      console.log('Transaction confirmed:', receipt);

      setRegistrationData({
        address: walletAddress,
        portfolioWebsite: portfolioWebsite,
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber
      });

      setTimeout(() => {
        alert('✅ Registration successful!');
        setPortfolioWebsite('');
        setCurrentStep(0);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      setCurrentStep(0);
      
      if (error.code === 'ACTION_REJECTED') {
        setStatusMessage('❌ Transaction rejected by user');
        alert('Transaction rejected by user');
      } else if (error.message.includes('user already registered')) {
        setStatusMessage('❌ User already registered');
        alert('Error: User already registered');
      } else if (error.message) {
        setStatusMessage(`❌ Error: ${error.message}`);
        alert(`Error: ${error.message}`);
      } else {
        setStatusMessage('❌ Registration failed');
        alert('Registration failed. Please try again.');
      }
      
      setTimeout(() => {
        setStatusMessage('');
        setIsSubmitting(false);
      }, 3000);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Register User</h2>
      
      {!walletAddress && (
        <div className="alert alert-warning">
          ⚠️ Please connect your MetaMask wallet to register
        </div>
      )}

      {walletAddress && !isCorrectNetwork && (
        <div className="alert alert-error">
          ⚠️ Wrong Network! Please switch to Polygon network
          <button 
            onClick={switchToPolygon}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Switch to Polygon
          </button>
        </div>
      )}

      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Portfolio Website
            </label>
            <input
              type="text"
              className="form-input"
              value={portfolioWebsite}
              onChange={(e) => setPortfolioWebsite(e.target.value)}
              placeholder="Enter your portfolio website URL (e.g., https://myportfolio.com)"
              disabled={!walletAddress || !isCorrectNetwork || isSubmitting}
            />
            <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
              This will register you as a user in the system
            </small>
          </div>

          {/* Progress Bar */}
          {isSubmitting && currentStep > 0 && (
            <div className="progress-container">
              <div className="progress-bar-wrapper">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(currentStep / REGISTRATION_STEPS.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="steps-container">
                {REGISTRATION_STEPS.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                  >
                    <div className="step-circle">
                      {currentStep > step.id ? '✓' : step.emoji}
                    </div>
                    <div className="step-label">{step.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="status-message">
                {statusMessage}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={!walletAddress || !isCorrectNetwork || isSubmitting}
          >
            {isSubmitting ? '⏳ Processing...' : '🚀 Register User'}
          </button>
        </form>

        {registrationData && currentStep === 5 && (
          <div className="result-box success-animation-box">
            <h3 className="result-title">✅ Registration Successful!</h3>
            <div className="result-content">
              <strong>Wallet Address:</strong> {registrationData.address}
              <br />
              <strong>Portfolio Website:</strong> {registrationData.portfolioWebsite}
              <br />
              <strong>Transaction Hash:</strong> 
              <a 
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#667eea', wordBreak: 'break-all', marginLeft: '0.5rem' }}
              >
                {txHash}
              </a>
              <br />
              <strong>Block Number:</strong> {registrationData.blockNumber}
              <br />
              <strong>Timestamp:</strong> {new Date(registrationData.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
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
        }

        .steps-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .step-item.active {
          opacity: 1;
          transform: scale(1.1);
        }

        .step-item.completed {
          opacity: 0.8;
        }

        .step-circle {
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

        .step-item.active .step-circle {
          background: rgba(255, 255, 255, 0.4);
          border-color: white;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          animation: pulse 1.5s infinite;
        }

        .step-item.completed .step-circle {
          background: #22c55e;
          border-color: #22c55e;
        }

        .step-label {
          font-size: 0.75rem;
          text-align: center;
          font-weight: 500;
          max-width: 100px;
        }

        .status-message {
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          animation: fadeIn 0.5s ease;
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

        .success-animation-box {
          animation: successBounce 0.6s ease;
        }

        @keyframes successBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @media (max-width: 768px) {
          .steps-container {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .step-item {
            flex-basis: 45%;
          }

          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .step-label {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;