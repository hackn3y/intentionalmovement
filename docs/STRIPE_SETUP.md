# Stripe Subscription Setup Guide

This guide will walk you through setting up Stripe subscriptions for the Intentional Movement platform.

---

## Prerequisites

- Stripe account (sign up at https://dashboard.stripe.com/register)
- Backend environment variables configured
- Admin access to Stripe Dashboard

---

## Step 1: Create Stripe Products

### Login to Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)

### Create Basic Monthly Product

1. Navigate to **Products** → **Add Product**
2. Fill in the details:
   - **Name:** `Basic Monthly`
   - **Description:** `Create unlimited posts, purchase up to 3 programs, basic achievements`
   - **Pricing Model:** Standard pricing
   - **Price:** `$9.99 USD`
   - **Billing Period:** Recurring - Monthly
   - **Trial Days:** `14` (optional - 14-day free trial)
3. Click **Add Product**
4. **Copy the Price ID** (starts with `price_...`)
   - Save as: `STRIPE_BASIC_MONTHLY_PRICE_ID`

### Create Basic Yearly Product

1. Click on the **Basic Monthly** product you just created
2. Click **Add another price**
3. Fill in:
   - **Price:** `$99 USD`
   - **Billing Period:** Recurring - Yearly
   - **Trial Days:** `14` (optional)
4. Click **Add price**
5. **Copy the Price ID**
   - Save as: `STRIPE_BASIC_YEARLY_PRICE_ID`

### Create Premium Monthly Product

1. Navigate to **Products** → **Add Product**
2. Fill in:
   - **Name:** `Premium Monthly`
   - **Description:** `Unlimited programs, unlimited messaging, all achievements, exclusive content`
   - **Price:** `$29.99 USD`
   - **Billing Period:** Recurring - Monthly
   - **Trial Days:** `14` (optional)
3. Click **Add Product**
4. **Copy the Price ID**
   - Save as: `STRIPE_PREMIUM_MONTHLY_PRICE_ID`

### Create Premium Yearly Product

1. Click on the **Premium Monthly** product
2. Click **Add another price**
3. Fill in:
   - **Price:** `$299 USD`
   - **Billing Period:** Recurring - Yearly
   - **Trial Days:** `14` (optional)
4. Click **Add price**
5. **Copy the Price ID**
   - Save as: `STRIPE_PREMIUM_YEARLY_PRICE_ID`

---

## Step 2: Update Environment Variables

### Backend `.env` File

Add these lines to `backend/.env`:

```env
# Stripe Subscription Price IDs (from Step 1)
STRIPE_BASIC_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_BASIC_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx

# App URL for Stripe redirects
APP_URL=http://localhost:8081
```

### Verify Existing Stripe Keys

Make sure you already have these in `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Step 3: Configure Webhooks

### Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your endpoint URL:
   - **Development:** `http://localhost:3001/api/purchases/webhook`
   - **Production:** `https://your-domain.com/api/purchases/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add Endpoint**
6. **Copy the Signing Secret** (starts with `whsec_...`)
7. Update `STRIPE_WEBHOOK_SECRET` in `backend/.env`

### Test Webhook (Development)

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
# Windows (with Scoop): scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/purchases/webhook

# This will output a webhook signing secret starting with whsec_
# Copy it to your .env file as STRIPE_WEBHOOK_SECRET
```

---

## Step 4: Test Subscription Flow

### Test Card Numbers

Use these test cards in Stripe test mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

### Test Flow

1. Start your backend server:
   ```bash
   npm run dev:backend
   ```

2. Start Stripe webhook forwarding (if local):
   ```bash
   stripe listen --forward-to localhost:3001/api/purchases/webhook
   ```

3. Test the subscription endpoints:

   **Get Available Plans:**
   ```bash
   curl http://localhost:3001/api/subscriptions/plans
   ```

   **Get Current Subscription:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/subscriptions/my-subscription
   ```

4. Test in mobile app:
   - Navigate to subscription screen
   - Select a plan
   - Use test card number
   - Verify subscription activates

---

## Step 5: Verify Webhook Events

### Check Webhook Logs

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click on your webhook endpoint
3. View **Recent Events** to see webhook deliveries
4. Check for any failed deliveries and debug

### Expected Webhook Flow

When a user subscribes:

1. `customer.subscription.created` → User gets trial period
2. `invoice.payment_succeeded` → Payment processed successfully
3. `customer.subscription.updated` → Subscription status updates

When subscription renews:

1. `invoice.payment_succeeded` → Monthly/yearly payment processed
2. `customer.subscription.updated` → Period dates updated

When subscription cancels:

1. `customer.subscription.updated` → `cancel_at_period_end` set to true
2. `customer.subscription.deleted` → Subscription ends, user reverts to free

---

## Step 6: Production Setup

### Switch to Live Mode

1. In Stripe Dashboard, toggle to **Live Mode** (top right)
2. Repeat Steps 1-3 with live products
3. Update production environment variables with **live** keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PUBLIC_KEY=pk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (from live webhook)
4. Update `APP_URL` to production domain

### Important Production Checks

- ✅ All price IDs are from **live mode**
- ✅ Webhook endpoint is publicly accessible (not localhost)
- ✅ Webhook secret is from **live mode** endpoint
- ✅ SSL/HTTPS is enabled on your domain
- ✅ Test a real subscription with a real card
- ✅ Verify webhooks are being received

---

## Pricing Summary

| Plan | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| Basic | $9.99 | $99 | $20/year (17%) |
| Premium | $29.99 | $299 | $60/year (17%) |

**Trial Period:** 14 days free for all paid plans

---

## Troubleshooting

### Price ID Not Found Error

**Problem:** `No such price: 'price_xxx'`

**Solution:**
- Verify you're using the correct price ID from Stripe Dashboard
- Make sure you're in the correct mode (test vs live)
- Check that the price ID in .env matches the one in Stripe

### Webhook Not Receiving Events

**Problem:** Subscription created but user tier not updating

**Solution:**
- Check webhook is configured correctly in Stripe Dashboard
- Verify webhook secret matches in .env
- Check backend logs for webhook errors
- Use `stripe listen --forward-to` for local testing
- Make sure endpoint is POST /api/purchases/webhook

### Subscription Not Activating

**Problem:** User pays but stays on free tier

**Solution:**
- Check webhook events are being delivered
- Verify userId and tier are in subscription metadata
- Check backend console logs for webhook handler errors
- Manually check Stripe Dashboard → Subscriptions to see status

### Trial Period Not Working

**Problem:** User charged immediately instead of after 14 days

**Solution:**
- Verify trial_period_days is set in checkout session
- Check product in Stripe Dashboard has trial days configured
- Ensure you're creating subscription with trial enabled

---

## Support

### Stripe Documentation

- [Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Testing](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### Need Help?

- Check Stripe Dashboard logs: **Developers** → **Logs**
- View webhook attempts: **Developers** → **Webhooks** → Your endpoint
- Contact Stripe Support: https://support.stripe.com

---

**Last Updated:** October 14, 2025
**Next Step:** [Build Mobile Subscription UI](./MOBILE_SUBSCRIPTION_UI.md)
