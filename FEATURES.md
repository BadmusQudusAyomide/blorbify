# Blorbify — Feature Inventory

_Last reviewed: 2026-07-05_

## Auth & Onboarding
- Email/password signup & login via Firebase Auth, with password-strength meter, show/hide toggle, "remember me" persistence
- Mandatory post-signup email verification via 6-digit OTP (backend-generated, hashed, 10-min expiry, resend cooldown, max attempts) — login itself doesn't require OTP
- Forgot-password flow via Firebase's reset email
- Google/Apple buttons are present but stubbed ("coming soon") — not functional
- 3-step onboarding wizard with Firestore draft autosave/resume: Business Info → Template & Color → Launch (publishes `stores/{uid}` + public `publicStores/{slug}`, auto-slugs the URL)

## Seller Dashboard (16 tabs)
- **Overview** — welcome banner + live stats (revenue, orders, customers, products)
- **Analytics** — 14-day revenue trend, AOV, repeat-customer rate, top-5 products, sales-by-category, orders-by-weekday
- **Products** — full CRUD, multi-photo upload (Cloudinary, drag/drop, cover selection), auto low-stock alert at ≤3 stock
- **Coupons** — percent/fixed discounts, expiry, usage limits, active/paused toggle
- **Reviews** — view/delete customer product reviews
- **Business Info** — edit name, type, description, contact, location, delivery fee, slug
- **Orders** — list + detail page with status timeline (pending→processing→shipped→delivered), one-click status advance (emails buyer), cancel, resend receipt
- **Invoices** — create ad-hoc invoices with line items, email as PDF, resend/download/mark-paid
- **Appearance** — swap templates, 6 theme colors, logo/banner upload, full storefront copy editor, social links, live preview
- **Logistics** — browse delivery-partner integrations (available/coming soon)
- **Services** — browse add-on business services by category
- **Referrals** — auto referral code/link, attributed-orders table with revenue
- **Sell in Person (POS)** — QR code linking to storefront for in-person sales
- **Payouts** — Paystack subaccount setup so buyer payments settle directly to seller's bank
- **Billing** — view/pick subscription plan, Paystack checkout
- **Reports** — date-range financial report (gross/refunds/net/orders), emailed CSV
- **Guided Tour** — spotlight walkthrough of the whole dashboard, auto-shown once per user + replayable via floating button

## Storefront Templates
5 designs — Signature, Noir, Bloom, Kitchen, Atelier — each with distinct layout/colors; customizable via theme colors, logo, banner, per-field copy, 6 social link types, delivery fee.

## Public Storefront (buyer-facing)
- Product browsing (search, category filters, wishlist)
- Product detail modal with gallery, reviews (view + submit), shareable deep-link with OG image
- Cart (localStorage-persisted, stock-capped, coupon input)
- Checkout: Paystack payment flow, or WhatsApp-based manual checkout (no gateway)
- Payment-return verification, referral-code capture (`?ref=`), abandoned-cart snapshot syncing (debounced, keyed on buyer email)
- Toast notifications throughout; newsletter signup (client-side only)

## Payments, Billing & Payouts (backend, Paystack)
- Plans: Starter ₦2,500/mo, Growth ₦6,500/mo, Pro ₦12,500/mo
- Subscription initialize/verify/relay endpoints + signed webhook handler
- Seller order payments routed to seller's own Paystack subaccount at **0% platform commission** (monetization is subscriptions only)
- Server-side order-total recomputation and transactional coupon consumption (never trusts client-sent amount)
- Seller ledger system (balances, refund booking, reconciliation, CSV export)

## Notifications (email)
Resend API → SMTP → Firestore-queue fallback chain. Templated emails for: OTP codes, signup/subscription welcome, order-status changes, low-stock alerts, abandoned-cart nudges, invoices/receipts.

## Invoices, Receipts & Reports (backend)
- PDF invoice generation (pdfkit) with resend/download/status endpoints
- Separate seller-facing PDF receipt emailed automatically after a paid order
- On-demand financial reports (CSV) + a daily automated job that emails every seller a monthly summary, plus a platform-wide summary to the founder — idempotency-guarded, Africa/Lagos timezone-aware

## Background Jobs
- Abandoned-cart sweep (every 30 min): nudges buyers after 2h idle, auto-expires snapshots after 7 days
- Monthly report job (daily interval, self-healing after downtime)
- Internal/relay routes (shared-secret protected) for manually triggering cart sweep, reconciliation, and report backfills

## Infra
Firebase ID-token auth middleware on all seller routes with ownership checks; separate relay-secret auth for server-to-server/cron calls; helmet/CORS/morgan; raw-body webhook route mounted ahead of JSON parsing for signature verification.
