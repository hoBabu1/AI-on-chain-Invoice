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
  const [paymentError, setPaymentError] = useState('');
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
      
      console.log('NFT Balance:', nftCount);
      
      if (nftCount === 0) {
        setUserNFTs([]);
        setLoading(false);
        return;
      }
      const nfts = [];
      const tokenCounter = await contract.getTokenCounter();
      
      console.log('Total Token Counter:', Number(tokenCounter));
      
      for (let i = 0; i < Number(tokenCounter); i++) {
        try {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            const tokenURI = await contract.tokenURI(i);
            nfts.push({ tokenId: i, tokenURI: tokenURI, owner: owner });
            console.log(`Found NFT #${i} owned by user`);
          }
        } catch (error) {
          console.log(`Token ${i} not found or burned`);
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
    setPaymentError('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      console.log('=== Payment Check Debug ===');
      console.log('Contract Address:', CONTRACT_ADDRESS);
      console.log('User Address:', checkAddress);
      console.log('Token ID:', parseInt(checkTokenId));
      
      // First check if the token exists
      try {
        const tokenOwner = await contract.ownerOf(parseInt(checkTokenId));
        console.log('Token Owner:', tokenOwner);
      } catch (ownerError) {
        console.error('Token does not exist:', ownerError);
        setPaymentError('Token ID does not exist. Please check the ID and try again.');
        setCheckingPayment(false);
        return;
      }
      
      // Now try to get payment info
      const info = await contract.getPaymentInfo(checkAddress, parseInt(checkTokenId));
      
      console.log('Raw payment info from contract:', info);
      console.log('Info structure:', {
        recipient: info[0] || info.recipient,
        payee: info[1] || info.payee,
        amount: info[2] || info.amount,
        paid: info[3] || info.paid
      });
      
      // Check if this is an empty/default struct (address(0) means no record)
      if (info[0] === '0x0000000000000000000000000000000000000000' || 
          (info.recipient && info.recipient === '0x0000000000000000000000000000000000000000')) {
        setPaymentError('No payment record found for this address and token ID combination.');
        setCheckingPayment(false);
        return;
      }
      
      // Parse the payment info
      const parsedInfo = {
        recipient: info[0] || info.recipient,
        payee: info[1] || info.payee,
        amount: ethers.formatEther(info[2] || info.amount),
        paid: info[3] !== undefined ? info[3] : info.paid
      };
      
      console.log('Parsed payment info:', parsedInfo);
      setPaymentInfo(parsedInfo);
      
    } catch (error) {
      console.error('=== Payment Check Error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      // Better error messages
      if (error.message.includes('invalid BigNumber')) {
        setPaymentError('Invalid token ID format');
      } else if (error.message.includes('revert')) {
        setPaymentError('Transaction reverted. No payment record exists for this combination.');
      } else if (error.message.includes('ERC721')) {
        setPaymentError('Token ID does not exist');
      } else {
        setPaymentError(error.message);
      }
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
      
      console.log('Checking token:', tokenAddress);
      const enabled = await contract.checkTokenEnabledOrNot(tokenAddress);
      console.log('Token enabled:', enabled);
      
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
      
      console.log('=== User Info Check Debug ===');
      console.log('Checking address:', userInfoAddress);
      
      const info = await contract.getUserInfo(userInfoAddress);
      
      console.log('Raw user info:', info);
      console.log('Info structure:', {
        user: info[0] || info.user,
        protfolioWebsite: info[1] || info.protfolioWebsite
      });
      
      // Extract the correct fields
      let userAddress, website;
      
      if (Array.isArray(info)) {
        userAddress = info[0];
        website = info[1];
      } else {
        userAddress = info.user;
        website = info.protfolioWebsite;
      }
      
      console.log('Extracted user address:', userAddress);
      console.log('Extracted website:', website);
      
      // Check if user is registered (user address is not zero address and has a website)
      const isRegistered = userAddress !== '0x0000000000000000000000000000000000000000' && 
                           website !== undefined && 
                           website !== '';
      
      const parsedInfo = {
        userAddress: userAddress,
        website: website || 'No website provided',
        registered: isRegistered
      };
      
      console.log('Final parsed info:', parsedInfo);
      setUserInfo(parsedInfo);
      
    } catch (error) {
      console.error('=== User Info Error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      
      alert('Error checking user info: ' + error.message);
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
        {/* NFT Section */}
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
              <p className="no-nfts-text-compact">No NFTs yet. Create your first invoice!</p>
            ) : (
              userNFTs.map((nft) => (
                <div key={nft.tokenId} className="nft-card-compact">
                  <div className="nft-id-compact">ID: #{nft.tokenId}</div>
                  <a href={nft.tokenURI} target="_blank" rel="noopener noreferrer" className="nft-link-compact">
                    View Details
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Check Payment Status */}
        <div className="dashboard-section checker-section">
          <h3 className="section-title-compact">Check Payment Status</h3>
          <div className="checker-form">
            <input 
              type="text" 
              className="form-input-compact" 
              placeholder="Payer wallet address" 
              value={checkAddress} 
              onChange={(e) => {
                setCheckAddress(e.target.value);
                setPaymentError('');
                setPaymentInfo(null);
              }} 
            />
            <input 
              type="number" 
              className="form-input-compact" 
              placeholder="Invoice/Token ID" 
              value={checkTokenId} 
              onChange={(e) => {
                setCheckTokenId(e.target.value);
                setPaymentError('');
                setPaymentInfo(null);
              }} 
            />
            <button 
              onClick={checkPaymentStatus} 
              className="btn-compact" 
              disabled={checkingPayment}
            >
              {checkingPayment ? 'Checking...' : 'Check'}
            </button>
          </div>
          
          {paymentError && (
            <div className="result-compact" style={{ background: 'rgba(255, 100, 100, 0.3)' }}>
              <p className="detail-compact" style={{ color: '#fff', textAlign: 'center' }}>
                ⚠️ {paymentError}
              </p>
            </div>
          )}
          
          {paymentInfo && !paymentError && (
            <div className="result-compact">
              <div className={`status-badge ${paymentInfo.paid ? 'paid-badge' : 'unpaid-badge'}`}>
                {paymentInfo.paid ? '✓ PAID' : '✗ NOT PAID'}
              </div>
              {paymentInfo.paid ? (
                <>
                  <p className="detail-compact">
                    <strong>Paid By:</strong><br/>
                    {paymentInfo.payee.substring(0, 10)}...{paymentInfo.payee.substring(paymentInfo.payee.length - 8)}
                  </p>
                  <p className="detail-compact">
                    <strong>Amount:</strong> {paymentInfo.amount} USDT
                  </p>
                  <p className="detail-compact">
                    <strong>Recipient:</strong><br/>
                    {paymentInfo.recipient.substring(0, 10)}...{paymentInfo.recipient.substring(paymentInfo.recipient.length - 8)}
                  </p>
                </>
              ) : (
                <>
                  <p className="detail-compact">
                    <strong>Recipient:</strong><br/>
                    {paymentInfo.recipient.substring(0, 10)}...{paymentInfo.recipient.substring(paymentInfo.recipient.length - 8)}
                  </p>
                  <p className="detail-compact">
                    <strong>Amount Due:</strong> {paymentInfo.amount} USDT
                  </p>
                  <p className="detail-compact" style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    💡 Payment not yet received
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Token Support */}
        <div className="dashboard-section checker-section">
          <h3 className="section-title-compact">Token Support</h3>
          <p className="info-text-compact">As of now ONLY USDT is enabled</p>
          <div className="checker-form">
            <input 
              type="text" 
              className="form-input-compact" 
              placeholder="0x0C5eFB8ec77E3464AB85C0564371Ec1E067F8546" 
              value={tokenAddress} 
              onChange={(e) => {
                setTokenAddress(e.target.value);
                setIsTokenEnabled(null);
              }} 
            />
            <button 
              onClick={checkToken} 
              className="btn-compact" 
              disabled={checkingToken}
            >
              {checkingToken ? 'Checking...' : 'Check Token'}
            </button>
          </div>
          {isTokenEnabled !== null && (
            <div className="result-compact">
              <div className={`status-badge ${isTokenEnabled ? 'enabled-badge' : 'disabled-badge'}`}>
                {isTokenEnabled ? '✓ ENABLED' : '✗ NOT ENABLED'}
              </div>
              {isTokenEnabled ? (
                <p className="detail-compact" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  This token can be used for payments
                </p>
              ) : (
                <p className="detail-compact" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  This token is not supported yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="dashboard-section checker-section">
          <h3 className="section-title-compact">User Info</h3>
          <p className="info-text-compact">Check if a user is registered</p>
          <div className="checker-form">
            <input 
              type="text" 
              className="form-input-compact" 
              placeholder="Wallet address" 
              value={userInfoAddress} 
              onChange={(e) => {
                setUserInfoAddress(e.target.value);
                setUserInfo(null);
              }} 
            />
            <button 
              onClick={checkUserInfo} 
              className="btn-compact" 
              disabled={checkingUserInfo}
            >
              {checkingUserInfo ? 'Checking...' : 'Get Info'}
            </button>
          </div>
          {userInfo && (
            <div className="result-compact">
              <div className={`status-badge ${userInfo.registered ? 'registered-badge' : 'unregistered-badge'}`}>
                {userInfo.registered ? '✓ REGISTERED' : '✗ NOT REGISTERED'}
              </div>
              {userInfo.registered ? (
                <>
                  <p className="detail-compact">
                    <strong>User:</strong><br/>
                    {userInfo.userAddress.substring(0, 10)}...{userInfo.userAddress.substring(userInfo.userAddress.length - 8)}
                  </p>
                  <p className="detail-compact">
                    <strong>Portfolio:</strong><br/>
                    <a 
                      href={userInfo.website.startsWith('http') ? userInfo.website : `https://${userInfo.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#ffd700', wordBreak: 'break-all' }}
                    >
                      {userInfo.website}
                    </a>
                  </p>
                </>
              ) : (
                <p className="detail-compact" style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  This address has not registered yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;