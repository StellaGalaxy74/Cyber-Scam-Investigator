# Smart Cyber Scam Investigator

AI-powered digital forensics and cyber scam investigation platform built with React, TypeScript, Tailwind CSS, Express, Drizzle ORM, Cloud SQL (PostgreSQL), Firebase Authentication, and the `@google/genai` SDK (`gemini-4-hydrogen`).

## Core Capabilities

1. **Message Scam Analyzer**: NLP and behavioral forensics for SMS, WhatsApp, email, job offers, lottery scams, and UPI phishing.
2. **SSRF-Protected URL & Website Scanner**: Lexical lookalike/typosquatting detection, punycode inspection, DNS resolution verification, passive TLS certificate inspection, and optional Google Safe Browsing / VirusTotal feed checks.
3. **Phone & Email Investigator**: E.164 format and country code checks, email syntax validation, disposable provider detection, and DNS MX / SPF / DMARC record checks.
4. **Screenshot & File OCR Analyzer**: In-memory upload (`PNG`, `JPG`, `WEBP`, `PDF`, `TXT`) using multimodal Gemini OCR extraction and fraud pattern forensics without executing untrusted files.
5. **AI Investigation Assistant**: Conversational cybersecurity investigator backed by persisted PostgreSQL chat history.
6. **12-Point Investigation Reports & PDF Export**: Client-side PDF generation via `jspdf`, clearly distinguishing verified technical facts, suspicious indicators, and AI predictions.
7. **India Cybercrime Emergency Resources**: Dedicated guidance for the **1930** National Cybercrime Helpline, **https://cybercrime.gov.in/**, RBI awareness, and digital evidence preservation.

## Environment Variables

Configure these variables in the environment / AI Studio Secrets panel (never commit secrets):

- `GEMINI_API_KEY` (Required): Server-side Gemini API key used exclusively in Express routes.
- `APP_URL` (Injected): Runtime application URL.
- `SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`, `SQL_PASSWORD`, `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD`: Managed Cloud SQL (PostgreSQL) connection parameters used via the `pg` Pool Object Method.
- `VIRUSTOTAL_API_KEY` (Optional): Enables live VirusTotal URL reputation checks when set.
- `GOOGLE_SAFE_BROWSING_API_KEY` (Optional): Enables live Google Safe Browsing v4 checks when set.

## Running & Deployment

- **Development**: `npm run dev` (starts Express + Vite middleware on port 3000)
- **Type Check**: `npm run lint` (`tsc --noEmit`)
- **Production Build**: `npm run build` (bundles frontend to `dist/`)
- **Production Start**: `npm start` (`node server.ts` serving API routes and `dist/`)
