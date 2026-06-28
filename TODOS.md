# TODOs & Research Notes

## OTP Delivery — WhatsApp Cloud API Research

### WhatsApp Cloud API Free Tier

WhatsApp's Cloud API offers **1,000 free conversation-based messages per month** per business phone number. OTPs can be sent as **utility template messages**, which are priced at a lower rate than marketing messages.

Key findings:
- **Free tier**: 1,000 conversations/month (includes utility, marketing, authentication, and service conversations)
- **OTP authentication**: WhatsApp supports pre-approved authentication templates with one-time-tap (autofill OTP) on supported devices
- **Cost after free tier**: ~₹0.27-0.50 per conversation (varies by region), significantly cheaper than SMS for many markets
- **No sender ID setup needed**: Just verify a business phone number
- **Template approval**: Authentication templates can be pre-approved by Meta

### Recommendation

Before committing to Twilio/MSG91 (paid SMS vendors), evaluate:
1. **Current OTP volume**: Estimate from waitlist signups and test accounts
2. **WhatsApp adoption**: Your target users (India) have ~90%+ WhatsApp penetration
3. **Fallback strategy**: Use WhatsApp as primary, SMS as fallback via a pay-per-use vendor

### WhatsApp API Setup Steps (when ready)
1. Create a Meta Business Account
2. Register a business phone number (can be virtual, e.g., from Twilio or Amazon Chime)
3. Set up WhatsApp Business Account (WABA)
4. Create authentication message templates in Meta Business Manager
5. Use the Cloud API endpoint: `POST /v22.0/{phone-number-id}/messages`
6. Authenticate via a permanent access token from System User

### Resources
- Meta WhatsApp Cloud API docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Authentication template guidelines: https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates
- Pricing: https://developers.facebook.com/docs/whatsapp/pricing

## Other Notes

- Add Sentry DSN for error tracking
- Connect live Razorpay keys for real payment processing
- Set up Google Maps API key for address autocomplete
