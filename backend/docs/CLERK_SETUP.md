# Clerk Integration - Configuration Guide

## ✅ Completed Implementation

### Database Changes
- Added `clerk_user_id` column to `users` table (unique, indexed)
- Migration applied: 003_add_clerk_user_id
- Users table now has: `user_id` (internal PK) + `clerk_user_id` (Clerk mapping)

### Backend Updates
- **ClerkService** (`services/core/clerk_service.py`):
  - JWT verification with JWKS caching (1-hour TTL)
  - Token decoding and validation
  - User info extraction from JWT payload

- **Auth Routes** (`api/auth/auth.py` and `api/webhooks.py`):
  - `get_current_user_id()`: Verifies Clerk JWT, returns internal user_id
  - `POST /api/webhooks`: Webhook for user.created/updated/deleted
  - `GET /auth/me`: Get current user profile
  - Removed old register/login endpoints (Clerk handles this)

- **Dependencies**:
  - Added `pyjwt[crypto]==2.8.0`
  - Added `cryptography==41.0.7`

---

## 🔧 Configuration Needed (Your Action Items)

### 1. Get Clerk Keys from Dashboard
Navigate to Clerk Dashboard and copy these values:

**API Keys** (Dashboard → API Keys):
- `CLERK_SECRET_KEY` - Backend secret key (sk_...)
- `CLERK_PUBLISHABLE_KEY` - Frontend public key (pk_...)

**Webhooks** (Dashboard → Webhooks):
- `CLERK_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)

### 2. Update .env File
Add these to `/backend/.env`:

```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...your_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_...your_publishable_key  # FYI only, frontend uses this
CLERK_WEBHOOK_SECRET=whsec_...your_webhook_secret
```

### 3. Update config.py with Your Clerk Domain
Edit `/backend/config.py` line with JWKS URL:

**Find your Clerk domain** in Clerk Dashboard → Settings → Domain

Replace:
```python
CLERK_JWKS_URL: str = "https://clerk.YOUR_DOMAIN.com/.well-known/jwks.json"
```

With (example):
```python
CLERK_JWKS_URL: str = "https://clerk.super-engine-lab.com/.well-known/jwks.json"
```

Or if using Clerk development:
```python
CLERK_JWKS_URL: str = "https://clerk.accounts.dev/.well-known/jwks.json"
```

### 4. Configure Clerk Webhook
In Clerk Dashboard → Webhooks:
1. Click "Add Endpoint"
2. URL: `https://your-backend-domain.com/api/webhooks`
3. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Copy webhook secret to .env

### 5. Frontend Integration Check
Your friend's frontend should:
- ✅ Use Clerk's React SDK (`@clerk/clerk-react`)
- ✅ Get session token: `await session.getToken()`
- ✅ Send in Authorization header: `Bearer <clerk_token>`

**Example frontend API call**:
```javascript
const token = await session.getToken();
const response = await fetch('https://api.example.com/campaigns', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🧪 Testing

### Test Webhook (Local Development)
Use ngrok or similar to expose local backend:
```bash
ngrok http 8000
# Use ngrok URL in Clerk webhook config
```

### Test Authentication Flow
1. User signs up in frontend (Clerk handles this)
2. Clerk sends webhook → Backend creates user + subscription + usage_metrics
3. Frontend gets session token
4. Frontend calls `GET /auth/me` with token → Backend verifies and returns user

### Verify Database
Check user created via webhook:
```sql
SELECT user_id, clerk_user_id, email, created_at FROM users;
```

---

## 📝 Notes

- **JWT Blacklist**: Removed (Clerk handles token revocation)
- **Password Storage**: None (Clerk manages passwords)
- **Old Endpoints**: Removed register/login (Clerk SDK handles this)
- **Subscription**: Automatically created on user.created webhook (free tier)
- **Migration Path**: user_id stays stable, clerk_user_id added for Clerk mapping

---

## ⚠️ Important

**Do NOT commit these to git:**
- CLERK_SECRET_KEY
- CLERK_WEBHOOK_SECRET

Add to `.gitignore`:
```
.env
```

Your frontend friend needs:
- CLERK_PUBLISHABLE_KEY (safe to commit if using public repo)
