import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalPageHeader } from '@/components/legal/legal-page-header'
import { LegalSection } from '@/components/legal/legal-section'
import { ContactSupportBlock } from '@/components/legal/contact-support-block'

export const metadata: Metadata = {
  title: 'Refund Policy | Novelify',
  description: 'Understand Novelify\'s refund policy for subscription plans, including the 14-day money-back guarantee, partial refunds, and how to request a refund.',
}

export default function RefundPage() {
  return (
    <LegalLayout>
      <LegalPageHeader
        title="Refund Policy"
        summary="We want you to be completely satisfied with Novelify. This policy outlines the terms and conditions under which refunds are issued for our subscription plans."
        lastUpdated="June 1, 2025"
      />

      <LegalSection title="1. 14-Day Money-Back Guarantee">
        <p style={{ margin: '0 0 12px' }}>
          We offer a 14-day money-back guarantee on all new subscription plans. If you are not satisfied with Novelify for any reason, you may request a full refund within 14 days of your initial purchase.
        </p>
        <p style={{ margin: 0 }}>
          This guarantee applies to the first subscription purchase on your account. Subsequent renewals or re-subscriptions after a previous refund are not eligible for the introductory guarantee.
        </p>
      </LegalSection>

      <LegalSection title="2. Annual Plan Refunds">
        <p style={{ margin: '0 0 12px' }}>
          For annual subscription plans, if you request a refund after the 14-day period, we will issue a prorated refund for the remaining months of your subscription term, minus any months already used. A processing fee of 5% or $10 (whichever is less) may be deducted to cover payment processing costs.
        </p>
        <p style={{ margin: 0 }}>
          Annual plan refunds are calculated as: (Annual fee / 12) × remaining full months in the billing cycle, minus applicable processing fees.
        </p>
      </LegalSection>

      <LegalSection title="3. Monthly Plan Refunds">
        <p style={{ margin: '0 0 12px' }}>
          Monthly subscription plans are billed on a recurring basis. After the initial 14-day guarantee period, monthly subscriptions are non-refundable for the current billing period. You may cancel your subscription at any time to prevent future charges, but the current month&apos;s fees will not be refunded.
        </p>
        <p style={{ margin: 0 }}>
          Cancellation takes effect at the end of the current billing cycle, and you will retain full access to paid features until that date.
        </p>
      </LegalSection>

      <LegalSection title="4. Add-Ons & One-Time Purchases">
        <p style={{ margin: '0 0 12px' }}>
          One-time purchases such as additional storage, AI credit top-ups, or premium templates are non-refundable unless the product is defective or not as advertised. Please contact our support team within 48 hours of purchase if you experience issues with an add-on.
        </p>
        <p style={{ margin: 0 }}>
          Refunds for defective add-ons are issued at our discretion following a review of the issue.
        </p>
      </LegalSection>

      <LegalSection title="5. How to Request a Refund">
        <p style={{ margin: '0 0 12px' }}>
          To request a refund, please email our billing team at <strong>billing@novelify.online</strong> with the following information:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>The email address associated with your Novelify account</li>
          <li>Your full name</li>
          <li>The reason for your refund request</li>
          <li>The date of your purchase (if known)</li>
        </ul>
        <p style={{ margin: '0 0 12px' }}>
          Refund requests are processed within 5-10 business days. Refunds are issued to the original payment method used for the purchase.
        </p>
        <p style={{ margin: 0 }}>
          We may request additional information to verify your identity and process your request. Fraudulent refund requests will be denied and may result in account suspension.
        </p>
      </LegalSection>

      <LegalSection title="6. Exceptions">
        <p style={{ margin: '0 0 12px' }}>
          Refunds are not available in the following circumstances:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Accounts that have violated our Terms of Service</li>
          <li>Multiple refund requests on the same account (limit of one refund per account)</li>
          <li>Requests made more than 60 days after the original charge date (except where required by local law)</li>
          <li>Subscriptions purchased through third-party platforms or promotional bundles with separate refund policies</li>
        </ul>
        <p style={{ margin: 0 }}>
          These exceptions do not affect your statutory rights under applicable consumer protection laws.
        </p>
      </LegalSection>

      <LegalSection title="7. Chargebacks">
        <p style={{ margin: '0 0 12px' }}>
          If you dispute a charge through your bank or payment provider (a chargeback), your account may be suspended until the dispute is resolved. If the chargeback is found to be unjustified, you will be responsible for any associated fees, and your account may be reactivated upon payment of the outstanding amount.
        </p>
        <p style={{ margin: 0 }}>
          We encourage you to contact us directly before initiating a chargeback so we can resolve any issues promptly.
        </p>
      </LegalSection>

      <LegalSection title="8. Statutory Rights">
        <p style={{ margin: 0 }}>
          This Refund Policy does not affect any statutory rights you may have under applicable consumer protection laws in your country of residence. Where local law provides for additional refund rights, those rights will apply.
        </p>
      </LegalSection>

      <ContactSupportBlock />
    </LegalLayout>
  )
}
