import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

function Dashboard({ walletAddress }) {
  const [userNFTs, setUserNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkAddress, setCheckAddress] = useState('');
  const [checkTokenId, setCheckTokenId] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [isTokenEnabled, setIsTokenEnabled] = useState(null);
  const [checkingToken, setCheckingToken] = useState(false);
  const [userInfoAddress, setUserInfoAddress] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [checkingUserInfo, setCheckingUserInfo] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchUserNFTs();
    }
  }, [walletAddress]);

  const fetchUserNFTs = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);
      const nftCount = Number(balance);
      if (nftCount === 0) {
        setUserNFTs([]);
        setLoading(false);
        return;
      }
      const nfts = [];
      const tokenCounter = await contract.getTokenCounter();
      for (let i = 0; i < Number(tokenCounter); i++) {
        try {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            const tokenURI = await contract.tokenURI(i);
            nfts.push({ tokenId: i, tokenURI: tokenURI, owner: owner });
          }
        } catch (error) {
          continue;
        }
      }
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      alert('Error fetching your NFTs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!checkAddress || !checkTokenId) {
      alert('Please enter both wallet address and token ID');
      return;
    }
    if (!ethers.isAddress(checkAddress)) {
      alert('Invalid wallet address');
      return;
    }
    setCheckingPayment(true);
    setPaymentInfo(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const info = await contract.getPaymentInfo(checkAddress, parseInt(checkTokenId));
      setPaymentInfo({
        recipient: info.recipient || info[0],
        payee: info.payee || info[1],
        amount: ethers.formatEther(info.amount || info[2]),
        paid: info.paid !== undefined ? info.paid : info[3]
      });
    } catch (error) {
      console.error('Error checking payment:', error);
      alert('Error: ' + error.message);
    } finally {
      setCheckingPayment(false);
    }
  };

  const checkToken = async () => {
    if (!tokenAddress) {
      alert('Please enter a token address');
      return;
    }
    if (!ethers.isAddress(tokenAddress)) {
      alert('Invalid token address');
      return;
    }
    setCheckingToken(true);
    setIsTokenEnabled(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const enabled = await contract.checkTokenEnabledOrNot(tokenAddress);
      setIsTokenEnabled(enabled);
    } catch (error) {
      console.error('Error checking token:', error);
      alert('Error checking token: ' + error.message);
    } finally {
      setCheckingToken(false);
    }
  };

  const checkUserInfo = async () => {
    if (!userInfoAddress) {
      alert('Please enter a wallet address');
      return;
    }
    if (!ethers.isAddress(userInfoAddress)) {
      alert('Invalid wallet address');
      return;
    }
    setCheckingUserInfo(true);
    setUserInfo(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const info = await contract.getUserInfo(userInfoAddress);
      setUserInfo({
        name: info[0] || info.name,
        registered: info[1] !== undefined ? info[1] : info.registered
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      alert('Error: ' + error.message);
    } finally {
      setCheckingUserInfo(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="page-container">
        <h2 className="page-title">Dashboard</h2>
        <div className="alert alert-warning">Please connect your wallet to view the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="dashboard-grid">
        <div className="dashboard-section nft-section">
          <div className="nft-header">
            <h3 className="section-title-compact">My Invoice NFTs</h3>
            <button onClick={fetchUserNFTs} className="refresh-btn-compact" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="nft-grid-compact">
            {loading ? (
              <p className="loading-text-compact">Loading...</p>
            ) : userNFTs.length === 0 ? (
              <p className="no-nfts-text-compact">No NFTs yet</p>
            ) : (
              userNFTs.map((nft) => (
                <div key={nft.tokenId} className="nft-card-compact">
                  <div className="nft-id-compact">ID: #{nft.tokenId}</div>
                  <a href={nft.tokenURI} target="_blank" rel="noopener noreferrer" className="nft-link-compact">View Details</a>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="dashboard-section checker-section">
          <h3 className="section-title-compact">Check Payment Status</h3>
          <div className="checker-form">
            <input type="text" className="form-input-compact" placeholder="Wallet address" value={checkAddress} onChange={(e) => setCheckAddress(e.target.value)} />
            <input type="number" className="form-input-compact" placeholder="Token ID" value={checkTokenId} onChange={(e) => setCheckTokenId(e.target.value)} />
          </div>
          <button onClick={checkPaymentStatus} className="btn-compact" disabled={checkingPayment}>{checkingPayment ? 'Checking...' : 'Check'}</button>
          {paymentInfo && (
            <div className={`result-compact ${paymentInfo.paid ? 'paid' : 'unpaid'}`}>
              {paymentInfo.paid ? (
                <><div className="status-badge paid-badge">PAID</div><p className="detail-compact">By: {paymentInfo.payee.substring(0, 6)}...{paymentInfo.payee.substring(paymentInfo.payee.length - 4)}</p></>
              ) : (
                <><div className="status-badge unpaid-badge">NOT PAID</div><p className="detail-compact">Amount: {paymentInfo.amount}</p></>
              )}
            </div>
          )}
        </div>
        <div className="dashboard-section checker-section">
          <h3 className="section-title-compact">Token Support</h3>
          <p className="info-text-compact">Only USDT supported</p>
          <div className="checker-form">
            <input type="text" className="form-input-compact" placeholder="Token address" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
          </div>
          <button onClick={checkToken} className="btn-compact" disabled={checkingToken}>{checkingToken ? 'Checking...' : 'Check'}</button>
          {isTokenEnabled !== null && (
            <div className={`result-compact ${isTokenEnabled ? 'enabled' : 'disabled'}`}>
              <div className={`status-badge ${isTokenEnabled ? 'enabled-badge' : 'disabled-badge'}`}>{isTokenEnabled ? 'ENABLED' : 'NOT ENABLED'}</div>
            </div>
          )}
        </div>
        <div className="dashboard-section checker-section">
          <h3 className="section-title-compact">User Info</h3>
          <div className="checker-form">
            <input type="text" className="form-input-compact" placeholder="Wallet address" value={userInfoAddress} onChange={(e) => setUserInfoAddress(e.target.value)} />
          </div>
          <button onClick={checkUserInfo} className="btn-compact" disabled={checkingUserInfo}>{checkingUserInfo ? 'Checking...' : 'Get Info'}</button>
          {userInfo && (
            <div className="result-compact">
              {userInfo.registered ? (
                <><div className="status-badge registered-badge">REGISTERED</div><p className="detail-compact">Name: {userInfo.name}</p></>
              ) : (
                <div className="status-badge unregistered-badge">NOT REGISTERED</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
