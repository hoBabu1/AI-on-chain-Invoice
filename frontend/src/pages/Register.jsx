import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, POLYGON_NETWORK } from '../config/contract';

function Register({ walletAddress }) {
  const [portfolioWebsite, setPortfolioWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if user is on correct network
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

  // Switch to Polygon network
  const switchToPolygon = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_NETWORK.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
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

    try {
      // Get provider and signer from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      console.log('Calling registerUser function...');
      console.log('Portfolio Website:', portfolioWebsite);
      console.log('User Address:', walletAddress);

      // Call the registerUser function - MetaMask will pop up for signature
      const tx = await contract.registerUser(portfolioWebsite);
      
      console.log('Transaction sent:', tx.hash);
      alert('Transaction sent! Waiting for confirmation...');

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      console.log('Transaction confirmed:', receipt);

      // Store the registration data
      setRegistrationData({
        address: walletAddress,
        portfolioWebsite: portfolioWebsite,
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber
      });

      setTxHash(tx.hash);

      alert('Registration successful!');
      
      // Clear form
      setPortfolioWebsite('');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error types
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction rejected by user');
      } else if (error.message.includes('user already registered')) {
        alert('Error: User already registered');
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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

          <button
            type="submit"
            className="submit-btn"
            disabled={!walletAddress || !isCorrectNetwork || isSubmitting}
          >
            {isSubmitting ? 'Registering... Check MetaMask' : 'Register User'}
          </button>
        </form>

        {registrationData && (
          <div className="result-box">
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
    </div>
  );
}

export default Register;