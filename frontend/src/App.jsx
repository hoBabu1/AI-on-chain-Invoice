import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import CreateInvoice from './pages/CreateInvoice';
import Payee from './pages/Payee';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
                  <span
                    className="wallet-address"
                    onClick={copyAddress}
                  >
                    {formatAddress(walletAddress)}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, opacity: 0.7 }}>
                      {copied
                        ? <polyline points="20 6 9 17 4 12" />
                        : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
                      }
                    </svg>
                    {copied && <span className="copied-tooltip">Copied!</span>}
                  </span>
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
          <div className="nav-links-center">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/create-invoice" className="nav-link">Create Invoice</Link>
            <Link to="/payee" className="nav-link">Payee</Link>
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