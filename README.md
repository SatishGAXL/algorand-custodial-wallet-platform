# Algorand Custodial Wallet Platform

A comprehensive platform for managing custodial wallets on the Algorand blockchain, enabling users to mint and transfer tokens and NFTs.

## Features

### User Authentication
- Secure signup/signin with JWT authentication
- Automatic Algorand account generation on signup
- Initial test tokens transfer for new accounts

### Token Management
- Create custom Algorand Standard Assets (ASA)
- Transfer tokens between accounts
- View token balances and transaction history

### NFT Management
- Mint ARC3-compliant NFTs with IPFS metadata storage
- Upload and manage NFT metadata and images
- Transfer NFTs between accounts
- View NFT collection with metadata

### User Dashboard
- Comprehensive profile section showing tokens and NFTs
- Real-time balance updates
- Transaction history viewer
- Asset management interface

## Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js Server Actions
- **Blockchain**: Algorand SDK, TestNet
- **Storage**: IPFS via NFT.Storage
- **Authentication**: JWT
- **Database**: Prisma with SQlite
- **Forms**: React Hook Form

## Setup Instructions

### Prerequisites
- Node.js 20 or higher
- SQlite database
- Algorand TestNet account
- NFT.Storage API key

### Environment Setup
1. Clone the repository:
```bash
git clone https://github.com/SatishGAXL/algorand-custodial-wallet-platform.git
cd algorand-custodial-wallet-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
copy contents for `.env` using `.env.sample` and place actual values in placeholders
```bash
cp .env.sample .env
```

4. Setup database:
```bash
npx prisma generate
npx prisma db push
```

### Running the Project

1. Development mode:
```bash
npm run dev
```

2. Production build:
```bash
npm run build
npm start
```

Access the application at `http://localhost:3000`

## Project Structure

```
login-poc/
├── actions/           # Server actions
├── components/        # React components
├── app/              # Next.js pages
├── prisma/           # Database schema
└── public/           # Static assets
```

## Key Workflows

1. **User Registration**
   - User registers with username/password
   - System creates Algorand wallet
   - Initial test tokens transferred



2. **Token/NFT Creation**
   - User fills creation form
   - Metadata uploaded to IPFS (for NFTs)
   - Asset created on Algorand blockchain

3. **Asset Transfer**
   - User initiates transfer
   - System checks recipient eligibility
   - Transaction executed on blockchain

## Security Considerations

- All private keys stored securely in database
- JWT authentication for all transactions
- Rate limiting on API endpoints
- Input validation for all forms
