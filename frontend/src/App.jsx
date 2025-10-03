import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Register from './pages/Register';
import CreateInvoice from './pages/CreateInvoice';
import Payee from './pages/Payee';
import './App.css';
import Dashboard from './pages/Dashboard';

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
          <div className="social-links left-social">
            <a href="https://github.com/hoBabu1" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/amankumarsah" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
          
          <div className="nav-links-center">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/create-invoice" className="nav-link">Create Invoice</Link>
            <Link to="/payee" className="nav-link">Payee</Link>
          </div>

          <div className="social-links right-social">
            <a href="https://medium.com/@dhanyosmiblog" target="_blank" rel="noopener noreferrer" className="social-icon" title="Medium">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
              </svg>
            </a>
            <a href="https://drive.google.com/file/d/1GITRIW-h4w4PuMmZpUpy_ttPl11cGoKv/view" target="_blank" rel="noopener noreferrer" className="social-icon resume-icon" title="Resume">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.5h8v1.5H8zm0-3h8V14H8zm0-3h5v1.5H8z"/>
              </svg>
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard walletAddress={walletAddress} />} />
            <Route path="/register" element={<Register walletAddress={walletAddress} />} />
            <Route path="/create-invoice" element={<CreateInvoice walletAddress={walletAddress} />} />
            <Route path="/payee" element={<Payee walletAddress={walletAddress} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;