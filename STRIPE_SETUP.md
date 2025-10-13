# Stripe Integration Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Create account with your email
4. Verify email address
5. Complete basic business information

### Step 2: Get Test API Keys
1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 3: Configure Backend
Update `backend/.env`:

```env
# Stripe (Payments) - Replace with your test values
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE  # Set this up in Step 5
```

### Step 4: Configure Mobile App
Update `mobile/.env`:

```env
# Stripe Publishable Key (Test Mode)
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### Step 5: Set Up Webhooks (Optional but Recommended)

#### Local Development (using Stripe CLI)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `backend/.env` as `STRIPE_WEBHOOK_SECRET`

#### Production (using Stripe Dashboard)
1. Go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret
6. Add to production `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Testing Payments

### Test Card Numbers
Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 0341` | Charge succeeds, card attached fails |

**Use any:**
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any 5-digit ZIP code

### Testing in Mobile App
1. Start mobile app: `cd mobile && npm start`
2. Navigate to a program purchase screen
3. Enter test card number: `4242 4242 4242 4242`
4. Complete purchase
5. Check Stripe Dashboard → **Payments** to see the test payment

### Testing in Admin Dashboard
1. Create a program in admin dashboard
2. Set a price (e.g., $29.99)
3. Purchase from mobile app
4. Verify payment appears in Stripe Dashboard

---

## Webhook Event Handling

The backend is configured to handle these webhook events:

### 1. Payment Success
```javascript
// Event: payment_intent.succeeded
// Action: Mark purchase as completed, grant access to program
```

### 2. Payment Failed
```javascript
// Event: payment_intent.payment_failed
// Action: Mark purchase as failed, notify user
```

### 3. Subscription Events
```javascript
// Event: customer.subscription.created
// Action: Create subscription record, grant access

// Event: customer.subscription.updated
// Action: Update subscription status

// Event: customer.subscription.deleted
// Action: Cancel subscription, revoke access
```

---

## Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution:**
- Make sure you're using TEST mode keys (start with `pk_test_` or `sk_test_`)
- Check for extra spaces in .env file
- Restart backend server after updating .env

### Issue: "Webhook signature verification failed"
**Solution:**
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Make sure webhook secret matches the endpoint
- For local dev, use Stripe CLI to forward webhooks

### Issue: "Payment requires authentication"
**Solution:**
- This is normal for certain test cards (3D Secure)
- Mobile app should handle authentication automatically
- Test with `4242 4242 4242 4242` for simple success

### Issue: "Network request failed"
**Solution:**
- Check backend is running on http://localhost:3001
- Verify `API_URL` in `mobile/.env` is correct
- For physical device, use computer's IP instead of localhost

---

## Production Checklist

Before going live:

- [ ] Switch to **LIVE MODE** in Stripe Dashboard
- [ ] Get live API keys (start with `pk_live_` and `sk_live_`)
- [ ] Update production `.env` with live keys
- [ ] Set up production webhook endpoint
- [ ] Verify webhook signature
- [ ] Test with real card (small amount)
- [ ] Set up payment failure notifications
- [ ] Configure refund policy
- [ ] Set up email receipts (Stripe can handle this)
- [ ] Enable fraud prevention tools
- [ ] Review Stripe fees and pricing

---

## Resources

- **Stripe Dashboard:** https://dashboard.stripe.com
- **API Documentation:** https://stripe.com/docs/api
- **Test Cards:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **React Native Integration:** https://stripe.com/docs/payments/accept-a-payment?platform=react-native

---

## Quick Command Reference

```bash
# Install Stripe CLI
# Windows: Download from https://github.com/stripe/stripe-cli/releases
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli#install

# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Test a webhook event
stripe trigger payment_intent.succeeded

# View recent events
stripe events list

# Get webhook signing secret
stripe listen --print-secret
```

---

## Support

For issues with Stripe integration:
1. Check Stripe Dashboard → **Developers** → **Logs** for errors
2. Review webhook event history
3. Check backend logs for webhook processing errors
4. Stripe Support: https://support.stripe.com

---

**Last Updated:** October 11, 2025
