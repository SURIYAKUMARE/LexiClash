# Security Policy — LexiClash / SkillPath AI

## 🔒 Security Architecture Overview

LexiClash is architected with a **Defense-in-Depth**, **Zero-Trust**, and **Privacy-by-Design** security model.

### 1. Cryptographic Authentication (Web Crypto API)
- Client-side credential authentication uses standard **PBKDF2** key derivation with individual 16-byte random salts and 100,000 iterations over SHA-512.
- Raw passwords and passcodes are never stored or logged in plain text.
- Session tokens use standard HMAC-SHA256 JWT signatures.

### 2. Client-Side Data Isolation & Privacy
- All local user state (skills, roadmap milestones, diagnostic scores, interview answers, and audit logs) is stored in client-side **Dexie IndexedDB**.
- Every record is strictly scoped and partitioned by `userId`.
- No user biometric, microphone, or external camera feeds are recorded or exfiltrated.

### 3. Non-Invasive Proctoring & Exam Integrity
- Assessment security is implemented using standardized browser APIs:
  - HTML5 Fullscreen API with inescapable lockout dialogs on escape.
  - Page Visibility API (`visibilitychange`) for tab-switch monitoring.
  - Window Focus (`blur`/`focus`) loss detection.
  - Debounced (800ms) violation escalation policy (1st warning, 2nd warning, 3rd review flag).
- All proctoring events are sealed with timestamped, client-verifiable audit hashes.

### 4. API & Transport Security
- Express API server enforces strict CORS whitelisting, JSON payload size restrictions (10MB maximum), and HTTP security response headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`).

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability or potential integrity flaw in LexiClash, please report it privately:
1. Open a confidential GitHub Security Advisory on the repository: https://github.com/SURIYAKUMARE/LexiClash/security/advisories/new
2. Or email our security response team directly with steps to reproduce.
3. We acknowledge reports within 24 hours and provide remediation updates within 48 hours.
