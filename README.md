# 🚀 XED Screener

> **FREE Solana token metadata infrastructure. No $300 fees. Permissionless, immutable, standardized.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://xedscreener.xyz)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Live Site:** [xedscreener.xyz](https://xedscreener.xyz)

---

## 💰 Why XED Screener?

### The Problem
- **DexScreener charges $300 per metadata update** — an absurd fee for basic infrastructure
- Trading terminals require metadata endpoints, but the cost barrier prevents many projects from updating their token information
- Centralized gatekeepers extract value from the Solana ecosystem

### The Solution
**XED Screener is completely FREE.** We handle the $2.56 terminal fee so you don't have to pay $300/update.

- ✅ **FREE** access (we cover the terminal cost)
- ✅ **Permissionless** — no gatekeepers, direct on-chain registration
- ✅ **Immutable** — cryptographic proof of asset authenticity
- ✅ **Standardized** — composable metadata standards for next-gen assets

---

## ✨ Features

### 01 // MODULAR
Composable metadata standards for next-gen assets. Build on a foundation that scales.

### 02 // PERMISSIONLESS
No gatekeepers. Direct on-chain registration. Your tokens, your control.

### 03 // VERIFIED
Cryptographic proof of asset authenticity. Trust through transparency.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/XedDexTools/xed-solana-metadata.git
cd xed-solana-metadata

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env.local` file (never commit this to git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin (server-side only, no NEXT_PUBLIC prefix)
ADMIN_PASSWORD=your_secure_password
```

> ⚠️ **Important:** Never commit `.env.local` or expose real credentials. The values above are placeholders only.

---

## 📖 Documentation

Full documentation is available at:
- **Live Docs:** [xedscreener.xyz/docs](https://xedscreener.xyz/docs)
- **API Endpoints:** See `/docs` for complete API reference

### Key Endpoints

- `POST /api/submit` - Submit token metadata
- `GET /api/token?mint=<mint_address>` - Fetch token metadata
- `POST /api/admin/login` - Admin authentication

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL + Storage)
- **Deployment:** [Vercel](https://vercel.com)

---

## 🎯 Usage

### For Token Creators

1. Visit [xedscreener.xyz/start](https://xedscreener.xyz/start)
2. Fill in your token metadata:
   - Wallet Address
   - Mint Address
   - Name, Symbol, Description
   - Logo/Image (upload or URL)
   - Social links (Twitter, Telegram, Website)
3. Submit — your metadata is now live and accessible via API

### For Trading Platforms

Use our public API endpoint:

```bash
GET https://xedscreener.xyz/api/token?mint=<MINT_ADDRESS>
```

Returns standardized JSON metadata compatible with trading terminals.

---

## 🔒 Security

- Admin authentication is handled server-side (no client-side password exposure)
- Environment variables are properly scoped (`NEXT_PUBLIC_` vs server-only)
- Secure API routes with proper error handling
- Memory leak prevention in file uploads

See [Security Model documentation](https://xedscreener.xyz/docs#security-model) for details.

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links

- **Live Site:** [xedscreener.xyz](https://xedscreener.xyz)
- **Documentation:** [xedscreener.xyz/docs](https://xedscreener.xyz/docs)

---

## 💬 Support

For issues, questions, or contributions, please open an [Issue](https://github.com/XedDexTools/xed-solana-metadata/issues) on GitHub.

---

**Built for the Solana community. Free forever. No gatekeepers. No $300 fees.**
