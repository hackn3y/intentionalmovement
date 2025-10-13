# Security Checklist & Guidelines

## 🔒 Sensitive Files - NEVER COMMIT THESE

The following files contain sensitive credentials and are protected by `.gitignore`:

### Backend
- ✅ `backend/.env` - All API keys and secrets
- ✅ `backend/firebase-service-account.json` - Firebase private key
- ✅ `backend/database.sqlite` - Development database

### Mobile
- ✅ `mobile/.env` - Firebase config, Stripe keys
- ✅ `mobile/google-services.json` - (when added) Android Firebase config
- ✅ `mobile/GoogleService-Info.plist` - (when added) iOS Firebase config

### Admin
- ✅ `admin-dashboard/.env` - Admin dashboard configuration

---

## 🚨 What To Do If Credentials Are Exposed

If you accidentally commit sensitive files to GitHub:

### Immediate Actions (Do within 1 hour):

1. **Revoke ALL exposed credentials immediately**

2. **AWS S3**
   - Go to AWS IAM Console
   - Security Credentials → Access Keys
   - Delete the exposed key
   - Create new access key
   - Update `backend/.env`

3. **SendGrid**
   - Go to SendGrid Dashboard
   - Settings → API Keys
   - Delete the exposed key
   - Create new API key
   - Update `backend/.env`

4. **Mux**
   - Go to Mux Dashboard
   - Settings → Access Tokens
   - Delete the exposed token
   - Create new token
   - Update `backend/.env`

5. **Stripe**
   - Go to Stripe Dashboard
   - Developers → API Keys
   - Roll keys (creates new set)
   - Update `backend/.env` and `mobile/.env`

6. **Firebase**
   - Go to Firebase Console
   - Project Settings → Service Accounts
   - Delete the exposed service account
   - Generate new private key
   - Update `backend/firebase-service-account.json`

7. **Clean Git History**
   ```bash
   # Remove file from all commits (nuclear option)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (WARNING: This rewrites history!)
   git push origin --force --all
   ```

---

## ✅ Before Every Git Commit

Run this checklist:

```bash
# 1. Check what you're committing
git status

# 2. Verify .env files are ignored (should show in ignored section)
git status --ignored | grep .env

# 3. Make sure no secrets in staged files
git diff --cached

# 4. Check for hardcoded secrets
grep -r "sk_test_" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "AKIA" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "firebase-adminsdk" . --exclude-dir=node_modules --exclude-dir=.git
```

---

## 🔐 Current Services & Credential Locations

| Service | Credentials Location | Public Info OK? |
|---------|---------------------|-----------------|
| **Firebase** | `backend/.env` + JSON file | ❌ Keep private |
| **SendGrid** | `backend/.env` | ❌ Keep private |
| **Mux** | `backend/.env` | ❌ Keep private |
| **AWS S3** | `backend/.env` | ❌ Keep private |
| **Stripe (Secret)** | `backend/.env` | ❌ Keep private |
| **Stripe (Publishable)** | `mobile/.env` | ⚠️ Less sensitive but still protect |
| **JWT Secret** | `backend/.env` | ❌ NEVER expose |
| **Admin Password** | `backend/.env` | ❌ NEVER expose |

---

## 🛡️ Additional Security Best Practices

### 1. Use Environment-Specific Credentials
- **Development:** Test keys (Stripe test mode, etc.)
- **Production:** Real keys (separate from dev)

### 2. Enable MFA Everywhere
- AWS Account
- Firebase Console
- Stripe Dashboard
- GitHub Account
- SendGrid Account
- Mux Account

### 3. Monitor for Exposed Secrets
Use GitHub secret scanning (enabled automatically for private repos) or tools like:
- `git-secrets` - Prevents committing secrets
- `truffleHog` - Scans for secrets in git history
- `detect-secrets` - Pre-commit hook for secret detection

### 4. Regular Credential Rotation
Rotate credentials every 90 days:
- AWS access keys
- API keys (SendGrid, Mux)
- JWT secret (requires re-login for all users)

### 5. Use Secret Management in Production
Consider using:
- **AWS Secrets Manager** - Encrypted secret storage
- **HashiCorp Vault** - Enterprise secret management
- **Environment variables in hosting platform** (Heroku, Vercel, etc.)

---

## 📝 .env.example Files

Your `.env.example` files are safe to commit. They should contain:
- ✅ Variable names
- ✅ Example/placeholder values
- ✅ Comments explaining what each variable does
- ❌ NO real credentials

Example:
```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

---

## 🚀 Deployment Security

### Never Deploy With:
- ❌ Debug mode enabled
- ❌ Verbose error messages
- ❌ Test API keys in production
- ❌ Default admin passwords
- ❌ Disabled security features

### Always Deploy With:
- ✅ Production API keys
- ✅ HTTPS/SSL enabled
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Security headers (Helmet.js)
- ✅ Input validation
- ✅ SQL injection prevention

---

## 🔍 Regular Security Audits

**Monthly:**
- Review AWS IAM users and permissions
- Check for unused API keys
- Review access logs

**Quarterly:**
- Run `npm audit` on all projects
- Update dependencies with security patches
- Review and rotate credentials

**Before Each Deployment:**
- Run security tests
- Check for hardcoded secrets
- Verify CORS configuration
- Test rate limiting

---

## 📞 Security Incident Response

If you discover a security issue:

1. **Assess the impact** - What was exposed? For how long?
2. **Contain** - Revoke exposed credentials immediately
3. **Investigate** - Check logs for suspicious activity
4. **Remediate** - Fix the vulnerability
5. **Document** - Record what happened and how it was fixed
6. **Learn** - Update processes to prevent recurrence

---

## ✅ Current Status

- [x] .gitignore properly configured
- [x] All sensitive files excluded from git
- [x] No credentials in git history
- [x] .env.example files created
- [x] Security documentation created
- [ ] MFA enabled on all services (recommended)
- [ ] Secret scanning enabled (if using GitHub)
- [ ] Regular credential rotation schedule (recommended)

---

**Last Updated:** October 13, 2025
**Maintained By:** Development Team
**Review Frequency:** Monthly
