# Acknowledgement

We would like to express our sincere gratitude to our project mentor, **Mr. Abhishek Kumar**, for his continuous guidance, technical insights, and encouragement throughout the development of this project. His knowledge of blockchain technology, decentralised systems, and artificial intelligence was invaluable in shaping the direction of this work.

We are also thankful to our Head of Department, **Prof. Priyanka Sinha (CSE – IoT)**, for her support and for providing the academic environment necessary to carry out this project.

A special thanks to the open-source community — the developers and contributors behind OpenZeppelin, Foundry, React, ethers.js, and Pinata — whose tools formed the backbone of this project.

Finally, we are grateful to our families and friends for their constant encouragement and moral support throughout this endeavour.

---

&nbsp;

**Aman Kumar** — Reg. No. 22155154003

**Khushhal Kumar** — Reg. No. 22155154026

**Branch:** CSE (IoT) | **Semester:** 7th | **Year:** 4th Year

&nbsp;

**Guide:** Mr. Abhishek Kumar

**Head of Department:** Prof. Priyanka Sinha, CSE (IoT)

---

# Table of Contents

TOC_PLACEHOLDER

---

# 1. Abstract

The freelance economy is rapidly growing, yet freelancers continue to face persistent challenges in establishing credibility, proving prior work, and receiving payments securely without relying on centralised intermediaries. Existing invoicing platforms are subject to data tampering, have no mechanism for public verifiability, and offer no cryptographic proof that a transaction occurred.

This project, **AI Invoice NFT**, addresses these challenges by combining two transformative technologies — **Artificial Intelligence (AI)** and **Blockchain** — to create a decentralised invoicing platform. Freelancers describe their completed work in plain English; a Large Language Model (Google Gemini AI) extracts structured invoice data from this natural language input. The structured invoice is then stored on the **InterPlanetary File System (IPFS)** via Pinata and minted as a **Non-Fungible Token (NFT)** on the **Polygon Amoy Testnet** blockchain, creating an immutable, publicly verifiable record of work performed.

Payments are processed directly on-chain using **USDT (ERC-20 stablecoin)**, eliminating hidden fees and intermediaries. The system is built using a Solidity smart contract following the ERC-721 standard, a React-based frontend, and a Node.js backend. Testing is performed using the Foundry framework.

The result is a transparent, tamper-proof, and AI-augmented invoice ecosystem that empowers freelancers with verifiable proof of work and seamless crypto payments.

---

# 2. Introduction

## 2.1 Overview of the Topic

The gig economy — comprising freelancers, independent contractors, and remote workers — is projected to represent over 50% of the global workforce within the next decade. Yet the infrastructure supporting this workforce remains archaic. Freelancers often work under informal agreements, with invoices stored in PDFs or spreadsheets that can be altered, lost, or disputed.

Blockchain technology, specifically **Non-Fungible Tokens (NFTs)**, offers a novel solution: any document, record, or asset can be minted as a unique, immutable digital token on a public ledger. Once minted, the data cannot be altered retroactively, and ownership can be verified by anyone at any time.

Simultaneously, the rapid advancement of **Large Language Models (LLMs)** has made it possible for users to interact with software using natural language. Instead of filling structured forms, a freelancer can simply describe their work in a sentence, and the AI extracts the relevant invoice fields automatically.

**AI Invoice NFT** brings these two paradigms together: AI reduces friction in invoice creation, and blockchain ensures the resulting invoice is permanent, public, and trustworthy.

## 2.2 Technology Domain

This project sits at the intersection of three technology domains:

- **Web3 / Blockchain Engineering** — Smart contracts, ERC-721 NFTs, ERC-20 token payments, Polygon network
- **Artificial Intelligence** — Natural language processing using Google Gemini (gemini-1.5-flash model)
- **Decentralised Storage** — IPFS via Pinata for off-chain metadata storage

## 2.3 Key Technical Concepts

| Term | Explanation |
|---|---|
| **NFT (Non-Fungible Token)** | A unique digital asset recorded on a blockchain; each token has a distinct identity and cannot be replicated |
| **ERC-721** | Ethereum standard for NFTs; defines how unique tokens are created and transferred |
| **ERC-20** | Ethereum standard for fungible tokens; used here for USDT payment processing |
| **Smart Contract** | Self-executing code deployed on the blockchain; enforces rules without a centralised authority |
| **IPFS** | InterPlanetary File System — a peer-to-peer protocol for storing and sharing data in a distributed fashion |
| **Polygon Amoy** | A test network (testnet) of the Polygon blockchain; allows development and testing without real funds |
| **LLM** | Large Language Model — an AI model trained on vast text data to understand and generate natural language |
| **Wallet / MetaMask** | A browser extension that allows users to interact with blockchain applications and sign transactions |
| **USDT** | Tether — a stablecoin pegged to the US Dollar, used for invoice payments in this system |

## 2.4 Current State of the Problem

Traditional freelance invoicing suffers from multiple systemic weaknesses:

- Invoices stored in PDFs or email threads can be altered or fabricated
- Centralised payment platforms (PayPal, Stripe) charge commissions and can freeze accounts
- Freelancers cannot share past client work publicly due to confidentiality agreements
- There is no standardised, verifiable proof-of-work record that future employers can independently validate

Blockchain-based solutions for invoicing exist (e.g., Request Network), but they require manual data entry and have steep learning curves. The integration of AI for natural language invoice generation, combined with NFT-based proof of work and on-chain payment settlement, is a novel combination that this project pioneers at a student level.

---

# 3. Problem Statement, Objectives, and Scope

## 3.1 Problem Statement

Freelancers face a credibility gap when applying for new opportunities: they cannot share previous client work due to confidentiality agreements, and existing invoices are easily falsifiable. There is no cryptographically verifiable, publicly auditable record of their completed engagements, hours worked, or amounts paid.

**Primary Problem:** Freelancers lack immutable, verifiable proof of completed work and received payments.

**Why it matters:**
- Employers and clients cannot trust self-reported work histories
- Payment disputes arise due to lack of transparent, on-chain records
- Manual invoice creation is error-prone and time-consuming

**Stakeholders Affected:**
- Freelancers seeking credibility and verifiable portfolios
- Clients who need transparency in payment confirmation
- Platforms seeking fraud-resistant payment rails

**Limitations of Current Solutions:**

| Current Solution | Limitation |
|---|---|
| PDF / Word Invoices | Easily editable; no verifiability |
| Freelance Platforms (Upwork, Fiverr) | Centralised; charge 10–20% fees; can be shut down |
| Request Network | Technical; no AI assistance; complex UX |
| Bank Transfers | No public record; not verifiable without third parties |

## 3.2 Objectives

**Primary Objective:**
To build a decentralised application (dApp) that enables freelancers to generate AI-powered invoices, mint them as NFTs on the Polygon blockchain, and accept cryptocurrency payments — creating an immutable, publicly verifiable proof-of-work portfolio.

**Secondary Objectives:**

1. Use a Large Language Model to convert plain English invoice descriptions into structured JSON invoice data
2. Store invoice metadata on IPFS to ensure decentralised, permanent storage
3. Implement an ERC-721 smart contract for NFT minting and an ERC-20 interface for USDT payment processing
4. Build an intuitive React frontend that abstracts away blockchain complexity for the end user
5. Enable iterative, conversational invoice refinement through a feedback loop between user and AI

**Measurable Outcomes:**

- A deployed smart contract on Polygon Amoy Testnet (verifiable on-chain)
- Successful AI-to-JSON invoice conversion from plain English within 5 interaction attempts
- NFT minting confirmed via blockchain transaction receipt
- End-to-end payment flow: token approval + payment settlement recorded on-chain
- All smart contract functions pass automated Foundry tests

## 3.3 Scope

**Included in Scope:**
- AI invoice generation using Google Gemini API (gemini-1.5-flash)
- ERC-721 NFT minting on Polygon Amoy Testnet
- On-chain user registration with portfolio URL
- USDT (ERC-20) payment processing via smart contract
- IPFS storage of invoice JSON via Pinata
- React + Vite frontend with MetaMask integration
- Foundry-based smart contract testing

**Explicitly Excluded:**
- Mainnet deployment (testnet only for this version)
- Native MATIC token as payment (planned for future)
- Support for multiple AI providers (only Gemini is integrated)
- Mobile application (web-only)
- Client-side ratings or feedback stored on-chain
- AI-generated invoice images (static image used currently)

**Target Users:** Freelancers (developers, designers, content creators) who are comfortable with MetaMask and cryptocurrency basics.

---

# 4. Literature Survey

## 4.1 Blockchain in Invoicing

**Request Network** (2017–present) is the most cited blockchain invoicing solution. It allows invoice creation and payment on Ethereum. However, it requires users to manually input all invoice fields, has no AI assistance, and the user interface is primarily developer-oriented [1].

**Opolis** and similar Web3 payroll platforms address payment automation but not invoice generation or proof-of-work portfolios.

## 4.2 NFTs as Proof of Work / Credentials

Academic research (Rooksby & Dimitrou, 2019; Grech & Camilleri, 2017) has explored blockchain for academic credential verification. The principle — that tokens can represent verifiable achievements — directly applies to freelance work records. LinkedIn's "Skills & Endorsements" are centralised and self-reported; NFT-based credentials are self-sovereign and cryptographically verifiable [2].

## 4.3 AI for Document Processing

Research in NLP has demonstrated the effectiveness of transformer-based LLMs in information extraction from unstructured text. OpenAI GPT-4, Google Gemini, and similar models can extract named entities, quantities, and relationships from natural language with high accuracy [3]. Prior work in invoice processing (Kang et al., 2019) focused on OCR-based extraction from scanned images; this project shifts the paradigm to natural language generation, where the user describes the invoice verbally.

## 4.4 IPFS for Decentralised Storage

Benet (2014) introduced IPFS as a content-addressed, peer-to-peer file system. Its use in NFT projects (popularised post-2020) addresses the "link rot" problem in early NFTs where metadata was stored on centralised servers. Pinata has emerged as the leading IPFS pinning service used by major NFT projects [4].

## 4.5 Identified Research Gaps

| Gap | This Project's Approach |
|---|---|
| No natural language invoice generation in existing blockchain invoicing tools | Gemini AI converts plain English to structured invoice JSON |
| Blockchain invoicing UX is developer-centric | React frontend abstracts complexity; MetaMask handles signing |
| NFTs as proof-of-work records for freelancers are unexplored | Each invoice NFT serves as a tamper-proof work record |
| On-chain payment combined with NFT invoicing is missing | Smart contract handles both NFT minting and ERC-20 payment |

---

# 5. Proposed System and Methodology

## 5.1 System Overview

The proposed system, AI Invoice NFT, is a full-stack decentralised application. It replaces the traditional invoicing workflow (manual form filling → PDF → email → bank transfer) with an AI-driven, blockchain-settled workflow:

```
User describes work in plain English
         |
         v
  Gemini AI extracts invoice fields
         |
         v
  User reviews and approves
         |
         v
  Invoice JSON uploaded to IPFS (Pinata)
         |
         v
  NFT minted on Polygon blockchain
         |
         v
  Client pays via USDT on-chain
         |
         v
  Payment recorded permanently on blockchain
```

## 5.2 System Architecture

The system has four distinct layers:

```
+----------------------------------------------------------+
|                    USER (Browser)                        |
|           React + Vite Frontend (ethers.js)              |
+------------------+-------------------+------------------+
                   |                   |
         REST API  |                   | Direct RPC call
                   |                   | (ethers.js -> MetaMask)
                   v                   v
+------------------+     +-------------+------------------+
|   Node.js Backend |     |     Polygon Amoy Testnet       |
|   Express Server  |     |   InvoiceNft Smart Contract   |
|                   |     |   (Solidity 0.8.20, ERC-721)  |
|  - Gemini AI API  |     +-------------------------------+
|  - Pinata IPFS    |
+------------------+
         |
         v
+------------------+
|   IPFS (Pinata)  |
|  Invoice JSON    |
|  stored as CID   |
+------------------+
```

**Components:**

| Component | Technology | Responsibility |
|---|---|---|
| Frontend | React 18 + Vite, ethers.js v6, React Router | UI, wallet connection, contract interaction |
| Backend | Node.js, Express.js | Gemini AI calls, IPFS upload via Pinata |
| Smart Contract | Solidity 0.8.20, OpenZeppelin | NFT minting, user registry, payment processing |
| Blockchain | Polygon Amoy Testnet | Transaction settlement, state storage |
| Storage | IPFS via Pinata | Invoice JSON metadata (off-chain) |
| AI | Google Gemini (gemini-1.5-flash) | Natural language invoice extraction and update |
| Testing | Foundry (forge) | Smart contract unit testing |

## 5.3 Smart Contract Design

The core of the system is the `InvoiceNft.sol` smart contract, which inherits from:
- **ERC-721** (OpenZeppelin) — for NFT functionality
- **Ownable** (OpenZeppelin) — for owner-restricted functions
- **SafeERC20** — for secure ERC-20 token transfers

**Data Structures:**

```
UserInfo {
    address user;
    string portfolioWebsite;
}

PaymentInfo {
    address recipient;   // Freelancer (invoice creator)
    address payee;       // Client (who paid)
    uint256 amount;      // Amount in wei (18 decimals)
    bool paid;           // Payment status
}
```

**State Variables:**

```
mapping(tokenId => tokenUri)       s_tokenIdToUri
mapping(user => UserInfo)          s_userInformation
mapping(user => tokenId => PaymentInfo)  s_paymentStatus
mapping(token => bool)             s_isTokenEnabled
uint256                            s_tokenCounter
```

**Key Functions:**

| Function | Access | Description |
|---|---|---|
| `registerUser(portfolioWebsite)` | Public | Registers freelancer with their portfolio URL |
| `mintNft(tokenUri, amount)` | Registered users only | Mints invoice as NFT |
| `paymentOfInvoice(recipient, token, invoiceNumber, amount)` | Public | Processes invoice payment in USDT |
| `enableToken(token)` | Owner only | Whitelists an ERC-20 token for payments |
| `getPaymentInfo(user, tokenId)` | View | Returns payment status for an invoice |
| `getUserInfo(user)` | View | Returns user registration details |
| `checkTokenEnabledOrNot(token)` | View | Returns whether a token is accepted |

## 5.4 AI Invoice Generation Flow

The backend uses Google Gemini (gemini-1.5-flash) in two modes:

**Mode 1 — Generate (first invoice draft):**
The user's natural language description is sent to Gemini with a structured system prompt. Gemini extracts: `amount`, `description`, `payer`, `recipient`, `workingHours` and returns a JSON object.

The backend also intelligently detects whether the user wants the AI to make assumptions (e.g., "estimate the rate") or strictly extract only explicit information — using keyword matching and a secondary AI intent-classification call.

**Mode 2 — Update (iterative refinement):**
If the user provides feedback ("amount should be 70", "payer is Alice"), the current invoice JSON and the feedback are sent to Gemini, which returns the updated invoice with only the changed fields modified.

Up to **5 attempts** are allowed per invoice session.

```
User Input (plain English)
         |
         v
   shouldAIAssume()  -----> keyword check + AI intent check
         |
    YES  |  NO
         |
  Assumption Mode   Strict Extraction Mode
         |                    |
         +--------------------+
                   |
                   v
          generateInvoice() --> Gemini API
                   |
                   v
           JSON Invoice Data
                   |
                   v
        User Reviews (up to 5 attempts)
                   |
           Feedback? --> updateInvoice() --> Gemini API
                   |
                   v (approved)
        uploadToIPFS() --> Pinata --> CID --> TokenURI
                   |
                   v
         mintNft(tokenUri, amountWei) --> Blockchain
```

## 5.5 Payment Flow

```
Client (Payee) enters:
  - Recipient wallet address
  - Invoice Number (NFT token ID)
  - Amount (USDT)
         |
         v
Step 1: tokenContract.approve(contractAddress, amount)
    --> MetaMask confirmation (Approval TX)
         |
         v
Step 2: invoiceContract.paymentOfInvoice(
           recipient, tokenAddress, invoiceNumber, amount)
    --> Smart contract verifies:
        - Token is enabled
        - Invoice owner matches recipient
        - Invoice not already paid
        - Amount matches stored amount
    --> SafeERC20.safeTransferFrom(payee -> recipient)
    --> PaymentInfo.paid = true
    --> Event emitted
         |
         v
Payment settled on-chain, permanently recorded
```

## 5.6 Development Methodology

**Agile Iterative Development** was followed with the following phases:

| Phase | Activities |
|---|---|
| Phase 1 — Research | Studied ERC-721, ERC-20 standards, OpenZeppelin libraries, Gemini API, Pinata SDK |
| Phase 2 — Smart Contract | Wrote and tested `InvoiceNft.sol` using Foundry; deployed to Polygon Amoy |
| Phase 3 — AI Backend | Built Node.js/Express backend; integrated Gemini for invoice generation and updates |
| Phase 4 — Frontend | Built React pages: Dashboard, Register, Create Invoice, Payee |
| Phase 5 — Integration | Connected frontend to backend REST API and smart contract via ethers.js |
| Phase 6 — Testing | Foundry tests for all contract flows; manual end-to-end testing on testnet |
| Phase 7 — Deployment | Frontend deployed on Vercel; backend deployed on Render |

**Testing Strategy:**

Smart contract tests (Foundry) cover the complete happy path:
1. Register user
2. Mint NFT (verify ownership and PaymentInfo)
3. Enable payment token
4. Transfer USDT to payee
5. Approve + process payment
6. Verify balances and payment status
7. Attempt duplicate registration (expect revert)

---

# 6. Hardware and Software Requirements

## 6.1 Hardware Requirements

| Requirement | Specification |
|---|---|
| Processor | Any modern dual-core processor (Intel i3 or equivalent); no GPU required |
| RAM | Minimum 4 GB; 8 GB recommended for running dev environment |
| Storage | 500 MB free disk space for project dependencies and build output |
| Network | Stable internet connection (required for blockchain RPC, Gemini API, Pinata) |
| Browser | Google Chrome or Chromium-based browser (required for MetaMask extension) |

*Note: The system is a cloud-deployed web application. End users require only a modern browser and MetaMask; no special hardware is needed.*

## 6.2 Software Requirements

**Programming Languages:**

| Language | Version | Usage |
|---|---|---|
| JavaScript (ES2022) | Node.js v18+ | Frontend, Backend, AI integration |
| Solidity | 0.8.20 | Smart contract |
| JSX | — | React UI components |

**Frameworks and Libraries:**

| Library / Framework | Version | Purpose |
|---|---|---|
| React | 18.x | Frontend UI framework |
| Vite | 5.x | Frontend build tool and dev server |
| React Router DOM | 6.x | Client-side routing |
| ethers.js | v6 | Ethereum/Polygon blockchain interaction |
| Express.js | 4.x | Backend REST API server |
| @google/generative-ai | latest | Google Gemini AI SDK |
| axios | 1.x | HTTP client (frontend to backend) |
| node-fetch | 3.x | HTTP client (backend to Pinata) |
| form-data | 4.x | Multipart form upload to Pinata |
| dotenv | 16.x | Environment variable management |
| cors | 2.x | Cross-origin request handling |
| OpenZeppelin Contracts | 5.x | ERC-721, ERC-20, Ownable, SafeERC20 base contracts |
| Foundry (forge) | latest | Solidity testing framework |

**Development Tools:**

| Tool | Purpose |
|---|---|
| VS Code | Primary code editor |
| MetaMask | Browser wallet for blockchain interaction |
| Foundry | Smart contract compilation, testing, deployment |
| Git / GitHub | Version control |
| Vercel | Frontend deployment (production) |
| Render | Backend deployment (production) |

**Third-Party APIs and Services:**

| Service | Usage |
|---|---|
| Google Gemini AI (gemini-1.5-flash) | Invoice extraction and update via LLM |
| Pinata (IPFS pinning) | Upload invoice JSON to IPFS; retrieve via gateway URL |
| Polygon Amoy Testnet | Blockchain for smart contract deployment and transactions |
| Alchemy | RPC provider for Polygon Amoy (used in Foundry fork tests) |
| PolygonScan (Amoy) | Block explorer for transaction verification |

**Operating System:** Linux / macOS / Windows (platform-independent; development done on Linux)

---

# 7. System Design

## 7.1 Use Case Diagram

```
                        +-------------------------------+
                        |        AI Invoice NFT         |
                        +-------------------------------+
                                     |
          +---------------------------+---------------------------+
          |                           |                           |
   +------+------+            +-------+------+           +-------+------+
   |  Freelancer  |            |    Client    |           |  Contract    |
   |  (Recipient) |            |   (Payee)    |           |   Owner      |
   +-------------+            +--------------+           +--------------+
          |                           |                           |
   +--------------+           +--------------+           +--------------+
   | Register User|           | Connect Wallet|           | Enable Token |
   +--------------+           +--------------+           +--------------+
   | Connect Wallet|          | Enter Invoice |
   +--------------+           | Details       |
   | Describe Work |          +--------------+
   | (Plain English)|         | Approve USDT  |
   +--------------+           +--------------+
   | Review AI    |           | Confirm Payment|
   | Invoice      |           +--------------+
   +--------------+
   | Approve &    |
   | Mint NFT     |
   +--------------+
   | View NFTs    |
   | (Dashboard)  |
   +--------------+
   | Check Payment|
   | Status       |
   +--------------+
```

## 7.2 Data Flow Diagram (Level 0 — Context Diagram)

```
+----------+   Invoice Description   +------------------+   Transaction   +-----------+
|Freelancer| ----------------------> | AI Invoice NFT   | <-------------- | Blockchain|
|          | <---------------------- |     System       | --------------> |  (Polygon)|
+----------+   NFT + Payment Status  +------------------+   NFT / Payment +-----------+
                                             |
                              +--------------+--------------+
                              |                             |
                        +-----+------+               +------+------+
                        |  Gemini AI |               |   Pinata    |
                        | (Invoice   |               |   IPFS      |
                        | Generation)|               |  (Storage)  |
                        +------------+               +-------------+
```

## 7.3 Data Flow Diagram (Level 1 — Detailed)

```
Freelancer
    |
    | 1. Register (portfolio URL)
    v
[Smart Contract] --> s_userInformation[address] = UserInfo

    |
    | 2. Plain English description
    v
[Backend Server]
    |
    | 3. POST /api/generate-invoice {action: 'generate'}
    v
[Gemini AI] --> returns JSON {amount, description, payer, recipient, workingHours}
    |
    | 4. User reviews; sends feedback if needed
    v
[Backend Server] POST /api/generate-invoice {action: 'update'}
    |
    | 5. Approved invoice JSON
    v
[Backend Server] POST /api/upload-to-ipfs
    |
    | 6. Upload JSON to Pinata
    v
[Pinata/IPFS] --> returns CID --> tokenUri = gateway URL
    |
    | 7. mintNft(tokenUri, amountWei)
    v
[Smart Contract]
    - s_tokenIdToUri[tokenCounter] = tokenUri
    - _safeMint(msg.sender, tokenCounter)
    - s_paymentStatus[user][tokenId] = PaymentInfo{...}
    - tokenCounter++

Client (Payee)
    |
    | 8. approve(contractAddress, amount) on USDT contract
    v
[USDT ERC-20 Contract] --> allowance updated

    | 9. paymentOfInvoice(recipient, token, invoiceId, amount)
    v
[Smart Contract]
    - Validates token, ownership, payment status, amount
    - safeTransferFrom(payee -> recipient)
    - paymentInfo.paid = true
    - emit PaymentSuccessful event
```

## 7.4 Smart Contract State Machine

```
  User State:
  [Unregistered] --registerUser()--> [Registered]
                                          |
                                   mintNft() allowed
                                          |
                                          v
  Invoice State:
  [Created: paid=false] --paymentOfInvoice()--> [Settled: paid=true]
       (cannot revert; no double payment)
```

## 7.5 Frontend Page Flow

```
  App.jsx (Router + Wallet State)
       |
       +------ / (Dashboard)
       |           - Fetch all NFTs owned by connected wallet
       |           - Payment status checker
       |           - Token enablement checker
       |           - User info lookup
       |
       +------ /register (Register)
       |           - Input portfolio URL
       |           - Call registerUser() on contract
       |
       +------ /create-invoice (CreateInvoice)
       |           - Input plain English description
       |           - Backend: AI generation/update
       |           - Backend: IPFS upload
       |           - Contract: mintNft()
       |           - Progress steps UI
       |
       +------ /payee (Payee)
                   - Input recipient, invoice ID, amount
                   - ERC-20 approve()
                   - Contract: paymentOfInvoice()
                   - Progress steps UI
```

---

# 8. Implementation Plan

## 8.1 Development Phases

| Phase | Description | Key Deliverables |
|---|---|---|
| 1 | Requirements & Research | Problem analysis, technology selection, architecture design |
| 2 | Smart Contract Development | `InvoiceNft.sol`, `ErrorsLib.sol`, `EventsLib.sol`, Foundry tests |
| 3 | Deployment | Smart contract deployed to Polygon Amoy Testnet |
| 4 | Backend Development | Express server, Gemini AI integration, Pinata IPFS upload |
| 5 | Frontend Development | React pages: Dashboard, Register, CreateInvoice, Payee |
| 6 | Integration & Testing | End-to-end testing on testnet with real MetaMask wallet |
| 7 | Production Deployment | Vercel (frontend), Render (backend) |

## 8.2 Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API rate limit or downtime | Low | High | Error handling in backend; retry logic |
| Pinata IPFS upload failure | Low | High | Validated response before minting |
| Smart contract bug after deployment | Medium | High | Thorough Foundry testing before deployment; testnet phase |
| MetaMask user rejects transaction | High | Low | User-facing error messages and reset option |
| Testnet RPC instability | Medium | Medium | Informative UI messages; refresh option |

---

# 9. Expected Results and Outcomes

## 9.1 Expected Results

| Feature | Expected Outcome |
|---|---|
| AI Invoice Generation | User provides 1–2 sentences; Gemini extracts all invoice fields within 1–2 attempts |
| NFT Minting | Transaction confirmed on Polygon Amoy; token visible in Dashboard within seconds |
| IPFS Upload | Invoice JSON accessible via Pinata gateway URL (permanent CID) |
| Payment Processing | USDT transferred from client to freelancer in a single on-chain transaction |
| Payment Status | Dashboard correctly reflects paid/unpaid status from on-chain data |
| User Registration | Portfolio URL stored on-chain; retrievable by anyone via `getUserInfo()` |

## 9.2 Performance Metrics

| Metric | Target |
|---|---|
| AI invoice generation time | < 3 seconds per attempt |
| IPFS upload time | < 5 seconds |
| Blockchain confirmation time | 2–10 seconds on Polygon Amoy |
| Frontend load time | < 2 seconds |
| Smart contract test coverage | All happy-path and revert cases covered |

## 9.3 Benefits of the System

**For Freelancers:**
- Immutable, tamper-proof record of all completed work
- No commission or platform fees; payments go directly to their wallet
- AI reduces invoice creation to seconds from minutes
- Public portfolio of verified work engagements

**For Clients:**
- Transparent payment trail; no disputes over whether payment was sent
- Verifiable invoice records linked to real wallet addresses
- Cannot pay the same invoice twice (double-payment protection in smart contract)

**For the Ecosystem:**
- Demonstrates practical integration of AI + blockchain for real-world use cases
- Open-source, extensible for other freelance industries

---

# 10. Future Scope

The current implementation is a functional proof-of-concept deployed on a testnet. Several enhancements are planned for future versions:

1. **Mainnet Deployment** — Deploy on Polygon Mainnet after security audit and gas optimisation of the smart contract.

2. **One-Time Registration Fee** — Charge a small on-chain fee during user registration to prevent spam registrations and Sybil attacks.

3. **Native Token Payments (MATIC)** — Enable payment in the blockchain's native currency in addition to USDT, reducing dependency on ERC-20 token availability.

4. **Client Remarks On-Chain** — Allow clients to attach a textual remark (feedback/rating) to a paid invoice, stored permanently on-chain, building a verifiable reputation system.

5. **AI-Generated NFT Images** — Replace the static invoice image with dynamically generated artwork unique to each invoice's content (recipient, description, amount), creating visually distinct NFTs.

6. **Payee Dashboard** — A dedicated dashboard for clients to view all invoices they have paid and track payment history.

7. **Multi-Token Support** — Enable additional stablecoins (USDC, DAI) and other tokens for payment flexibility.

8. **Smart Contract Audit** — A formal security audit by a third-party firm before mainnet deployment to identify and resolve vulnerabilities.

9. **Mobile Wallet Support** — Integration with WalletConnect to support mobile wallets (Rainbow, Trust Wallet) in addition to MetaMask.

10. **Decentralised AI** — Explore replacing the centralised Gemini API with a decentralised AI inference layer (e.g., running LLMs on-chain or via verifiable inference proofs) to achieve full decentralisation.

---

# 11. Conclusion

This project successfully demonstrates the convergence of Artificial Intelligence and Blockchain technology to solve a real-world problem faced by the growing freelance community. By leveraging Google Gemini AI for natural language invoice generation and the Polygon blockchain for immutable NFT-based proof of work, the system eliminates the friction, opacity, and untrustworthiness of traditional invoicing methods.

The smart contract (`InvoiceNft.sol`), built with industry-standard OpenZeppelin libraries and thoroughly tested with Foundry, ensures that invoice creation, payment processing, and user registration are governed by transparent, self-executing code — not centralised intermediaries. IPFS via Pinata guarantees that invoice metadata remains permanently accessible and tamper-proof.

The AI integration reduces the time required to create an invoice from minutes to seconds, democratising access to professional invoicing for freelancers who may lack accounting expertise. The conversational feedback loop allows users to iteratively refine the AI-generated invoice before it is permanently minted on the blockchain.

In achieving its objectives — AI-powered invoice generation, NFT minting as proof of work, and on-chain crypto payment settlement — this project makes a meaningful contribution to the Web3 ecosystem and demonstrates the feasibility of building user-friendly dApps that solve genuine human problems.

The project is live on Vercel and fully functional on the Polygon Amoy Testnet, serving as both a working prototype and a foundation for future mainnet deployment.

---

# References

[1] Request Network Foundation, "Request Network: Decentralised Network for Payment Requests," *White Paper*, 2017. [Online]. Available: https://request.network/

[2] A. Grech and A. F. Camilleri, "Blockchain in Education," *European Commission — Joint Research Centre*, Luxembourg: Publications Office of the European Union, 2017. doi: 10.2760/60649

[3] T. Brown et al., "Language Models are Few-Shot Learners," in *Advances in Neural Information Processing Systems (NeurIPS 2020)*, vol. 33, pp. 1877–1901, 2020.

[4] J. Benet, "IPFS — Content Addressed, Versioned, P2P File System," *arXiv preprint*, arXiv:1407.3561, 2014. [Online]. Available: https://arxiv.org/abs/1407.3561

[5] OpenZeppelin, "OpenZeppelin Contracts Documentation," 2024. [Online]. Available: https://docs.openzeppelin.com/contracts/

[6] Ethereum Foundation, "EIP-721: Non-Fungible Token Standard," *Ethereum Improvement Proposals*, 2018. [Online]. Available: https://eips.ethereum.org/EIPS/eip-721

[7] Ethereum Foundation, "EIP-20: Token Standard," *Ethereum Improvement Proposals*, 2015. [Online]. Available: https://eips.ethereum.org/EIPS/eip-20

[8] Polygon Technology, "Polygon Amoy Testnet Documentation," 2024. [Online]. Available: https://polygon.technology/

[9] Google DeepMind, "Gemini: A Family of Highly Capable Multimodal Models," *arXiv preprint*, arXiv:2312.11805, 2023. [Online]. Available: https://arxiv.org/abs/2312.11805

[10] Foundry Book, "Foundry: Blazing Fast, Portable and Modular Toolkit for Ethereum Application Development," 2024. [Online]. Available: https://book.getfoundry.sh/

---

*End of Report*
