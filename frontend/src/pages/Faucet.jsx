import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { USDT_TOKEN_ADDRESS, USDT_ABI, POLYGON_NETWORK } from '../config/contract';

function Faucet({ walletAddress }) {
  const [balance, setBalance] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [claimAmount] = useState(1000);

  useEffect(() => {
    if (walletAddress) {
      checkNetwork();
      fetchBalance();
    }
  }, [walletAddress]);

  const checkNetwork = async () => {
    if (!window.ethereum) return;
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
          alert('Failed to add Polygon network to MetaMask');
        }
      }
    }
  };

  const fetchBalance = async () => {
    if (!walletAddress || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(USDT_TOKEN_ADDRESS, USDT_ABI, provider);
      const decimals = await contract.decimals();
      const raw = await contract.balanceOf(walletAddress);
      setBalance(ethers.formatUnits(raw, decimals));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const claimTokens = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }
    if (!isCorrectNetwork) {
      alert('Please switch to Polygon Amoy Testnet first!');
      return;
    }

    setIsClaiming(true);
    setTxHash('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(USDT_TOKEN_ADDRESS, USDT_ABI, signer);
      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(String(claimAmount), decimals);

      const tx = await contract.mint(walletAddress, amount, {
        maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
        maxFeePerGas: ethers.parseUnits('50', 'gwei'),
      });

      setTxHash(tx.hash);
      await tx.wait();
      await fetchBalance();
      alert(`Successfully claimed ${claimAmount} mUSDT!`);
    } catch (error) {
      console.error('Claim error:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction rejected.');
      } else {
        alert('Claim failed: ' + error.message);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="page-container">
        <h2 className="page-title">mUSDT Faucet</h2>
        <div className="alert alert-warning">
          🔌 Please connect your wallet to use the faucet
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">mUSDT Faucet</h2>

      {!isCorrectNetwork && (
        <div className="alert alert-error">
          ⚠️ Wrong Network! Please switch to Polygon Amoy Testnet
          <button
            onClick={switchToPolygon}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Switch to Polygon
          </button>
        </div>
      )}

      <div className="form-box">
        {/* Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '0.5rem' }}>This is a test token for Polygon Amoy Testnet only</p>
          <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem', wordBreak: 'break-all' }}>
            Token: <strong>{USDT_TOKEN_ADDRESS}</strong>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.3rem' }}>Your mUSDT Balance</p>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>
              {balance !== null ? `${parseFloat(balance).toLocaleString()} mUSDT` : '...'}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.3rem' }}>Claim Amount</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{claimAmount} mUSDT</p>
          </div>

          <button
            onClick={claimTokens}
            disabled={isClaiming || !isCorrectNetwork}
            style={{
              background: isClaiming ? 'rgba(255,255,255,0.2)' : 'white',
              color: isClaiming ? 'white' : '#764ba2',
              border: '2px solid white',
              padding: '0.9rem 3rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: isClaiming || !isCorrectNetwork ? 'not-allowed' : 'pointer',
              opacity: !isCorrectNetwork ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isClaiming ? '⏳ Claiming...' : '🚰 Claim mUSDT'}
          </button>
        </div>

        {/* Tx Hash */}
        {txHash && (
          <div className="result-box">
            <h3 className="result-title">✅ Claim Successful!</h3>
            <div className="result-content">
              <strong>Transaction:</strong>{' '}
              <a
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#667eea', wordBreak: 'break-all' }}
              >
                {txHash}
              </a>
            </div>
          </div>
        )}

        {/* How to use */}
        <div style={{
          background: '#f8f9fa',
          border: '2px solid #667eea',
          borderRadius: '10px',
          padding: '1.5rem',
          marginTop: '1.5rem',
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.1rem' }}>How to use mUSDT</h3>
          <ol style={{ color: '#555', lineHeight: '2', paddingLeft: '1.2rem' }}>
            <li>Claim mUSDT from this faucet</li>
            <li>Go to the <strong>Create Invoice</strong> page to generate an invoice NFT</li>
            <li>Share your invoice Token ID with the payer</li>
            <li>Payer uses the <strong>Payee</strong> page to pay with mUSDT</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Faucet;
