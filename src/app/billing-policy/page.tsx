import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalPageHeader } from '@/components/legal/legal-page-header'
import { LegalSection } from '@/components/legal/legal-section'
import { ContactSupportBlock } from '@/components/legal/contact-support-block'

export const metadata: Metadata = {
  title: 'Billing Policy | Novelify',
  description: 'Details about Novelify\'s subscription plans, billing cycles, payment methods, price changes, failed payments, and account cancellation procedures.',
}

export default function BillingPolicyPage() {
  return (
    <LegalLayout>
      <LegalPageHeader
        title="Billing Policy"
        summary="This Billing Policy explains the payment terms, subscription plans, billing cycles, and related policies for using Novelify&apos;s paid services."
        lastUpdated="June 1, 2025"
      />

      <LegalSection title="1. Subscription Plans">
        <p style={{ margin: '0 0 12px' }}>
          Novelify offers multiple subscription tiers, including a Free plan with limited features and paid plans with additional capabilities. The features, limits, and pricing for each plan are described on our pricing page and are subject to change with notice.
        </p>
        <p style={{ margin: 0 }}>
          Paid plans are available on a monthly or annual billing cycle. Annual plans are billed once per year at a discounted rate compared to monthly billing.
        </p>
      </LegalSection>

      <LegalSection title="2. Payment Methods">
        <p style={{ margin: '0 0 12px' }}>
          We accept the following payment methods:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Visa, Mastercard, American Express, and Discover credit and debit cards</li>
          <li>PayPal (in select regions)</li>
        </ul>
        <p style={{ margin: '0 0 12px' }}>
          All payments are processed securely through Stripe, our PCI-DSS compliant payment processor. Novelify does not store full credit card numbers on its servers.
        </p>
        <p style={{ margin: 0 }}>
          By providing a payment method, you authorize Novelify to charge the applicable fees to your chosen payment method. You agree to keep your billing information current and accurate.
        </p>
      </LegalSection>

      <LegalSection title="3. Billing Cycle & Renewal">
        <p style={{ margin: '0 0 12px' }}>
          Monthly subscriptions are billed on the same day each month (the &quot;billing date&quot;) corresponding to your original sign-up date. If the billing date does not exist in a given month (e.g., the 31st), billing will occur on the last day of that month.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          Annual subscriptions are billed once every 12 months on the anniversary of your original purchase date.
        </p>
        <p style={{ margin: 0 }}>
          All subscriptions automatically renew at the end of each billing period unless cancelled before the renewal date. You will receive a receipt via email after each successful payment.
        </p>
      </LegalSection>

      <LegalSection title="4. Price Changes">
        <p style={{ margin: '0 0 12px' }}>
          Novelify reserves the right to modify subscription pricing at any time. We will provide at least 30 days&apos; notice of any price increase via email or through the Platform.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          Price changes take effect at the start of your next billing cycle. If you do not agree to a price change, you may cancel your subscription before the new pricing takes effect. Continued use of the Platform after a price change constitutes acceptance of the new pricing.
        </p>
        <p style={{ margin: 0 }}>
          Existing annual subscribers are locked into the pricing in effect at the time of their annual payment until their next renewal date.
        </p>
      </LegalSection>

      <LegalSection title="5. Failed Payments & Dunning">
        <p style={{ margin: '0 0 12px' }}>
          If a payment attempt fails (e.g., due to an expired card or insufficient funds), we will make up to three additional attempts over a 10-day period to process the payment. This is referred to as the &quot;dunning period.&quot;
        </p>
        <p style={{ margin: '0 0 12px' }}>
          During the dunning period, your account will remain active. You will receive email notifications alerting you to the failed payment with instructions to update your payment method.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          If all payment attempts fail, your account will be downgraded to the Free plan, and you will lose access to paid features. Your content will not be deleted, and you may resubscribe at any time by updating your payment method.
        </p>
        <p style={{ margin: 0 }}>
          Novelify is not responsible for service interruptions caused by failed payments.
        </p>
      </LegalSection>

      <LegalSection title="6. Cancellation">
        <p style={{ margin: '0 0 12px' }}>
          You may cancel your subscription at any time through your account settings under &quot;Subscription & Billing.&quot; Upon cancellation:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>You will retain full access to paid features until the end of the current billing period</li>
          <li>Your account will be downgraded to the Free plan at the start of the next billing cycle</li>
          <li>No further charges will be made to your payment method</li>
          <li>No refunds are provided for the remaining portion of the current billing period (except as outlined in our Refund Policy)</li>
        </ul>
        <p style={{ margin: 0 }}>
          To cancel, navigate to <strong>Settings &gt; Subscription & Billing &gt; Cancel Subscription</strong>. You will be asked to confirm your cancellation and provide optional feedback.
        </p>
      </LegalSection>

      <LegalSection title="7. Taxes">
        <p style={{ margin: '0 0 12px' }}>
          Subscription fees are exclusive of applicable taxes, including sales tax, VAT, GST, or similar transaction taxes. The amount of tax charged will be based on the billing information you provide, including your country and state of residence.
        </p>
        <p style={{ margin: 0 }}>
          You are responsible for ensuring that your billing information is accurate for tax calculation purposes. If you are tax-exempt, please contact our billing team with your exemption documentation.
        </p>
      </LegalSection>

      <LegalSection title="8. Payment Disputes">
        <p style={{ margin: '0' }}>
          If you believe you have been charged incorrectly, please contact our billing team at <strong>billing@novelify.online</strong> within 30 days of the charge. We will investigate and resolve the issue promptly. Unresolved disputes may be subject to the procedures outlined in our Terms of Service.
        </p>
      </LegalSection>

      <ContactSupportBlock />
    </LegalLayout>
  )
}
