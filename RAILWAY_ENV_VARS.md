# Railway Environment Variables

## Strapi CMS (cms)

Copy these variables to Railway for the CMS service:

```
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
APP_KEYS=toBeModified1,toBeModified2,toBeModified3,toBeModified4
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Important:**
- `DATABASE_URL` should reference your Railway PostgreSQL service using `${{Postgres.DATABASE_URL}}`
- Generate secure random strings for APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, TRANSFER_TOKEN_SALT, JWT_SECRET using: `openssl rand -base64 32`

---

## Frontend (frontend)

Copy these variables to Railway for the Frontend service:

```
NEXT_PUBLIC_STRAPI_URL=https://your-cms-service.railway.app
STRAPI_API_TOKEN=your_strapi_api_token_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51QNfKHP0Bvv9P6lLjZwxHJiSBbFSKRUNFSwdBFkRQiWqJPISFD2cXIBCKBCLOFIi8NfKrFo8LRjxHfS3AuGOhwSC00BKoI3zVR
STRIPE_SECRET_KEY=sk_test_51QNfKHP0Bvv9P6lLn5NVGEaqDwEkMHaXwTJ8C0LwPClNZnrI6KpRnGq8axqrlzyugikWlwLJLvIbBLyMv2dxjQan007NlaSdg2
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_FB_PIXEL_ID=
```

**Important:**
- Replace `https://your-cms-service.railway.app` with actual Railway CMS URL
- Generate STRAPI_API_TOKEN in Strapi Admin: Settings > API Tokens > Create new API Token (Full access)
- These are TEST Stripe keys - safe for development
- STRIPE_WEBHOOK_SECRET: create webhook in Stripe Dashboard pointing to `https://your-frontend.railway.app/api/webhooks/stripe`

---

## Order of Deployment

1. Deploy PostgreSQL (Railway template)
2. Deploy CMS with variables above
3. Wait for CMS to start, create API token in admin panel
4. Deploy Frontend with variables above (including the API token)
