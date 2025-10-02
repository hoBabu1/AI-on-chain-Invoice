import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Register from './pages/Register';
import CreateInvoice from './pages/CreateInvoice';
import Payee from './pages/Payee';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed! Please install MetaMask to use this app.');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setWalletAddress(accounts[0]);
      console.log('Connected account:', accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Router>
      <div className="App">
        {/* Header with Project Name and Connect Wallet Button */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="project-name">AI Invoice NFT</h1>
            <div className="wallet-section">
              {walletAddress ? (
                <div className="wallet-connected">
                  <span className="wallet-address">{formatAddress(walletAddress)}</span>
                  <button onClick={disconnectWallet} className="disconnect-btn">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="connect-wallet-btn"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="navigation">
          <Link to="/" className="nav-link">Register</Link>
          <Link to="/create-invoice" className="nav-link">Create Invoice</Link>
          <Link to="/payee" className="nav-link">Payee</Link>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Register walletAddress={walletAddress} />} />
            <Route path="/create-invoice" element={<CreateInvoice walletAddress={walletAddress} />} />
            <Route path="/payee" element={<Payee walletAddress={walletAddress} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;