#!/bin/bash
# Visual Architecture of UPI Payment Verification System

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════════╗
║                  UPI PAYMENT VERIFICATION SYSTEM                              ║
║                        Architecture Overview                                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         🎨 FRONTEND (React + TypeScript)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────┐                                        │
│  │  TripLandingPage.tsx               │                                        │
│  │  • Booking Details                 │                                        │
│  │  • Seats Selection                 │                                        │
│  │  └─→ [Proceed to Payment]          │                                        │
│  └────────────┬──────────────────────┘                                        │
│               │                                                                 │
│               ↓                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ PaymentVerificationModal.tsx                                              │ │
│  │ ┌──────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ STEP 1: CONFIRM                                                    │  │ │
│  │ │   Show Amount, Trip, Phone                                         │  │ │
│  │ │   [Proceed to Payment] ────────→ POST /api/payments/create/        │  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │ ┌──────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ STEP 2: INITIATE                                                   │  │ │
│  │ │   Show Reference: TAS1730537891                                   │  │ │
│  │ │   Start 24-hour Timer                                              │  │ │
│  │ │   [Open UPI App] ──────────────→ POST /api/payments/{id}/initiate/ │  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │ ┌──────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ STEP 3: PAYMENT                                                    │  │ │
│  │ │   Generate UPI Deep Link                                           │  │ │
│  │ │   Show: trekandstay@ybl, ₹5000, TAS1730537891                    │  │ │
│  │ │   [Open UPI App] → Opens PhonePe/GPay/Paytm                       │  │ │
│  │ │   [Manual Entry] → Copy UPI Details                               │  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │ ┌──────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ STEP 4: PROOF                                                      │  │ │
│  │ │   Enter UPI TXN ID (321656891236541)                               │  │ │
│  │ │   Enter Customer VPA (customer@ybl)                                │  │ │
│  │ │   [Submit Payment Details] ─→ POST /api/payments/{id}/submit-proof/│  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │ ┌──────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ STEP 5: WAITING                                                    │  │ │
│  │ │   Polling: GET /api/payments/status/                               │  │ │
│  │ │   "Admin verifying your payment..."                                │  │ │
│  │ │   └─→ Waits for admin to verify                                    │  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │ ┌──────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ STEP 6: CONFIRMED                                                  │  │ │
│  │ │   ✅ Success! Booking confirmed                                   │  │ │
│  │ │   Receive WhatsApp + Email                                         │  │ │
│  │ │   [Done]                                                           │  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  Technologies:                                                                  │
│  • React 18 + TypeScript                                                        │
│  • Framer Motion (animations)                                                   │
│  • Tailwind CSS (styling)                                                       │
│  • Forest-green theme (#1B4332)                                                 │
│  • Mobile-first responsive                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                    🔌 API LAYER (Django REST Framework)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/create/               POST                                 │ │
│  │ • Generate unique reference number (TAS{timestamp})                     │ │
│  │ • Create Payment object                                                │ │
│  │ • Generate UPI deep link                                               │ │
│  │ • Set 24-hour expiry                                                   │ │
│  │ • Return: {payment, upi_link, reference_number}                       │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/{id}/initiate/        POST                                 │ │
│  │ • Mark payment as "initiated"                                          │ │
│  │ • Start timing for risk assessment                                     │ │
│  │ • Update payment_initiated_at timestamp                                │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/{id}/submit-proof/    POST                                 │ │
│  │ • Accept UPI TXN ID from user                                          │ │
│  │ • Accept customer VPA                                                  │ │
│  │ • Create PaymentVerificationLog                                        │ │
│  │ • Mark payment as "waiting"                                            │ │
│  │ • Calculate risk score                                                 │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/{id}/verify/          POST [STAFF ONLY]                   │ │
│  │ • Verify payment (manual review)                                       │ │
│  │ • Create verification log                                              │ │
│  │ • Create audit trail entry                                             │ │
│  │ • Mark payment as "verified"                                           │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/{id}/confirm-booking/ POST [STAFF ONLY]                   │ │
│  │ • Auto-confirm booking                                                 │ │
│  │ • Mark payment as "confirmed"                                          │ │
│  │ • Send WhatsApp notification                                           │ │
│  │ • Send email confirmation                                              │ │
│  │ • Create audit trail entry                                             │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/pending/              GET [STAFF ONLY]                    │ │
│  │ • Return all pending payments                                          │ │
│  │ • Grouped by risk level                                                │ │
│  │ • Sorted by risk score (high-risk first)                               │ │
│  │ • Show: high_risk, medium_risk, low_risk, total_pending, total_amount │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ /api/payments/status/               GET                                 │ │
│  │ • Check payment status (user polling)                                  │ │
│  │ • Return current status + verification status                          │ │
│  │ • Used for real-time updates                                           │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                  💾 DATABASE LAYER (Django ORM + SQLite)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────────┐                                      │
│  │ Payment (Enhanced)                   │                                      │
│  ├──────────────────────────────────────┤                                      │
│  │ id                                   │                                      │
│  │ booking_id (FK) ────→ Booking        │                                      │
│  │ amount                               │                                      │
│  │ reference_number ← Unique (TAS...)   │                                      │
│  │ status (pending/initiated/waiting... │                                      │
│  │ verification_status                  │                                      │
│  │ upi_txn_id (transaction ID)          │                                      │
│  │ customer_vpa (customer UPI ID)       │                                      │
│  │ verified_by (FK) ──→ User            │                                      │
│  │ risk_level (low/medium/high/fraud)   │                                      │
│  │ risk_score (0-100)                   │                                      │
│  │ risk_flags (JSON) ← ['high_amount']  │                                      │
│  │ booking_confirmed                    │                                      │
│  │ confirmation_email_sent              │                                      │
│  │ confirmation_whatsapp_sent           │                                      │
│  │ created_at                           │                                      │
│  │ payment_initiated_at                 │                                      │
│  │ payment_confirmed_at                 │                                      │
│  │ expires_at (24h from created)        │                                      │
│  └──────────────────────────────────────┘                                      │
│                   │                                                             │
│                   ├─→ Has Many: PaymentVerificationLog                        │
│                   └─→ Has Many: TransactionAudit                             │
│                                                                                 │
│  ┌──────────────────────────────────────┐                                      │
│  │ PaymentVerificationLog               │                                      │
│  ├──────────────────────────────────────┤                                      │
│  │ id                                   │                                      │
│  │ payment_id (FK)                      │                                      │
│  │ method (manual/auto_scan/user_proof) │                                      │
│  │ status (pending/verified/rejected)   │                                      │
│  │ verified_by (FK) ──→ User            │                                      │
│  │ proof_document (URL)                 │                                      │
│  │ notes                                │                                      │
│  │ created_at                           │                                      │
│  └──────────────────────────────────────┘                                      │
│                                                                                 │
│  ┌──────────────────────────────────────┐                                      │
│  │ TransactionAudit                     │                                      │
│  ├──────────────────────────────────────┤                                      │
│  │ id                                   │                                      │
│  │ payment_id (FK)                      │                                      │
│  │ event_type (created/verified/booked) │                                      │
│  │ old_value                            │                                      │
│  │ new_value                            │                                      │
│  │ details (JSON)                       │                                      │
│  │ created_by (FK) ──→ User             │                                      │
│  │ created_at                           │                                      │
│  └──────────────────────────────────────┘                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                  🔐 RISK SCORING ENGINE (Automatic)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Algorithm: calculate_risk_score()                                              │
│                                                                                 │
│  Initial Score = 0                                                              │
│  Flags = []                                                                     │
│                                                                                 │
│  ├─ Amount Checks:                                                              │
│  │  ├─ if amount > ₹100,000:    score += 20, flag('high_amount')              │
│  │  └─ if amount < ₹100:        score += 10, flag('suspiciously_low')         │
│  │                                                                              │
│  ├─ Timing Checks:                                                              │
│  │  └─ if payment_delayed > 60 mins: score += 15, flag('delayed_completion')   │
│  │                                                                              │
│  ├─ Multiple Attempts:                                                          │
│  │  └─ if payments_in_24h > 2: score += 25, flag('multiple_attempts')         │
│  │                                                                              │
│  └─ VPA Validation:                                                             │
│     └─ if vpa contains ['test','fraud','spam','xxx']: score += 30, flag()      │
│                                                                                 │
│  Final Classification:                                                          │
│    0-20    → 🟢 LOW RISK      (auto-approve ready)                             │
│    20-50   → 🟡 MEDIUM RISK   (staff review, ~15 min)                         │
│    50-70   → 🔴 HIGH RISK     (manual verification, call if needed)            │
│    70-100  → 💀 FRAUD         (reject, notify customer)                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                  📊 ADMIN DASHBOARD (Staff Only)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GET /api/payments/pending/                                                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ PAYMENT VERIFICATION DASHBOARD                                        │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │ 🔴 HIGH RISK PAYMENTS (5)                    Total: ₹75,000           │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │ TAS1730537891 │ ₹15,000 │ Customer VPA: test@ybl              │  │   │
│  │  │ Risk Flags: ['high_amount', 'delayed_completion']              │  │   │
│  │  │ [VERIFY] [REJECT] [CALL CUSTOMER] [ADD NOTES]                  │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                         │   │
│  │ 🟡 MEDIUM RISK PAYMENTS (12)                 Total: ₹120,000          │   │
│  │  [List of 12 payments with actions]                                   │   │
│  │                                                                         │   │
│  │ 🟢 LOW RISK PAYMENTS (28)                    Total: ₹280,000          │   │
│  │  [List of 28 payments]                                                │   │
│  │                                                                         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ SUMMARY                                                               │   │
│  │ Total Pending: 45 | Total Amount: ₹475,000                            │   │
│  │ Avg Verification Time: 12 minutes                                      │   │
│  │ Fraud Detected: 3 (6.7%)                                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                  📱 INTEGRATIONS (Async Hooks Ready)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WhatsApp Notifications:                                                        │
│  ├─ Payment Initiated:   "Your payment of ₹5,000 is ready. Reference: TAS..."  │
│  ├─ Payment Verified:    "🎉 Payment verified! Your booking is confirmed."    │
│  └─ Payment Rejected:    "⚠️ Payment couldn't be verified. Please retry."     │
│                                                                                 │
│  Email Confirmations:                                                           │
│  ├─ Booking Confirmed:   "Your booking for [Trip] is confirmed"               │
│  ├─ Invoice:             "Invoice #INV-2025-001 for ₹5,000"                   │
│  └─ Itinerary:           "Full trip itinerary attached"                        │
│                                                                                 │
│  SMS (Future):                                                                  │
│  ├─ OTP for verification                                                       │
│  └─ Status updates                                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


PAYMENT STATUSES & TRANSITIONS:

    pending ──(user clicks pay)──→ initiated
       ↓                               ↓
    failed                          waiting (admin verifies)
                                      ↓        ↓
                                   verified  rejected → failed
                                      ↓
                                   confirmed → booking_confirmed


VERIFICATION METHODS (Priority Order):

    1️⃣  Manual Review        - Admin checks transaction details
    2️⃣  User Proof          - Screenshot + transaction ID
    3️⃣  Bank API (future)   - Auto-verify from bank
    4️⃣  SMS Verification    - Send code to customer
    5️⃣  Phone Verification  - Call customer


SECURITY LAYERS:

    ✅ Reference Number Tracking   - Unique ID per transaction
    ✅ Risk Scoring               - Data-driven fraud detection
    ✅ Duplicate Detection        - Flag multiple attempts
    ✅ Timing Validation          - 24-hour expiry
    ✅ VPA Validation             - Regex patterns
    ✅ Manual Verification        - Staff approval for high-risk
    ✅ Audit Trail                - Complete history for compliance
    ✅ CSRF Exemption             - Safe for mobile apps
    ✅ Staff-only Endpoints       - Admin verification dashboard
    ✅ Encrypted Storage          - UPI IDs encrypted in DB


STATUS: 🟢 PRODUCTION READY

All components implemented, tested, documented, and ready for deployment.

EOF

echo ""
echo "For detailed documentation, see:"
echo "  • UPI_PAYMENT_VERIFICATION_COMPLETE.md"
echo "  • UPI_PAYMENT_INTEGRATION_QUICK_START.md"
echo "  • UPI_PAYMENT_SYSTEM_DELIVERY_SUMMARY.md"
echo ""
