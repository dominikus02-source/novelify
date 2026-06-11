import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalPageHeader } from '@/components/legal/legal-page-header'
import { LegalSection } from '@/components/legal/legal-section'
import { ContactSupportBlock } from '@/components/legal/contact-support-block'

export const metadata: Metadata = {
  title: 'Privacy Policy | Novelify',
  description: 'Learn how Novelify collects, uses, stores, and protects your personal data when you use our AI-powered novel writing platform.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <LegalPageHeader
        title="Privacy Policy"
        summary="This Privacy Policy explains how Novelify collects, uses, discloses, and safeguards your personal information when you use our platform. We are committed to protecting your privacy."
        lastUpdated="June 1, 2025"
      />

      <LegalSection title="1. Information We Collect">
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#F5F5F7' }}>Account Information</p>
        <p style={{ margin: '0 0 12px' }}>
          When you create an account, we collect your name, email address, and a password. If you subscribe to a paid plan, we collect billing information such as your name, billing address, and payment method details. Payment transactions are processed by our third-party payment processor (Stripe), and we do not store full credit card numbers on our servers.
        </p>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#F5F5F7' }}>User Content</p>
        <p style={{ margin: '0 0 12px' }}>
          We collect and store the manuscripts, outlines, character profiles, notes, and other content you create, upload, or generate using Novelify. This content is processed to provide our AI-assisted writing features.
        </p>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#F5F5F7' }}>Usage Data</p>
        <p style={{ margin: '0 0 12px' }}>
          We automatically collect information about how you interact with the Platform, including pages visited, features used, writing session duration, and AI feature usage. This data helps us improve the service.
        </p>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#F5F5F7' }}>Device & Technical Data</p>
        <p style={{ margin: 0 }}>
          We may collect your IP address, browser type, operating system, device identifiers, and approximate geographic location for security, analytics, and performance optimization purposes.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p style={{ margin: '0 0 12px' }}>
          We use your information for the following purposes:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>To provide, maintain, and improve the Novelify platform and its features</li>
          <li>To process your subscription and billing transactions</li>
          <li>To power AI-assisted writing features, including generating suggestions and analyzing your writing</li>
          <li>To send service-related communications, including updates, security alerts, and support messages</li>
          <li>To respond to your inquiries and provide customer support</li>
          <li>To detect, prevent, and address technical issues, fraud, or abuse</li>
          <li>To comply with legal obligations and enforce our Terms of Service</li>
        </ul>
        <p style={{ margin: 0 }}>
          We do not sell your personal information to third parties. We do not use your manuscripts or creative content to train our AI models without your explicit consent.
        </p>
      </LegalSection>

      <LegalSection title="3. Data Sharing & Disclosure">
        <p style={{ margin: '0 0 12px' }}>
          We may share your information in the following circumstances:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li><strong>Service Providers:</strong> With trusted third-party vendors who help us operate the Platform, including cloud hosting (AWS), payment processing (Stripe), email delivery, and analytics services. These providers are bound by data processing agreements.</li>
          <li><strong>Legal Compliance:</strong> When required by law, court order, or government request, or to protect our rights, property, or safety.</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
        </ul>
        <p style={{ margin: 0 }}>
          We do not share your manuscripts or personal creative content with third parties for their own purposes.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Security">
        <p style={{ margin: '0 0 12px' }}>
          We implement industry-standard security measures to protect your information, including:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Encryption of data in transit using TLS 1.3</li>
          <li>Encryption of data at rest using AES-256</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Strict access controls and authentication requirements for our employees and contractors</li>
          <li>Secure data centers with physical security protections</li>
        </ul>
        <p style={{ margin: 0 }}>
          While we strive to protect your data, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p style={{ margin: '0 0 12px' }}>
          We retain your account information for as long as your account remains active. User Content is retained until you delete it or close your account. After account deletion, we retain your data for a period of 30 days, after which it is permanently deleted, except where we are required to retain certain information for legal compliance or legitimate business purposes (e.g., billing records retained for tax purposes).
        </p>
        <p style={{ margin: 0 }}>
          You may request earlier deletion of your data by contacting our support team.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Rights & Choices">
        <p style={{ margin: '0 0 12px' }}>
          Depending on your jurisdiction, you may have the following rights regarding your personal information:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data</li>
          <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
          <li><strong>Objection:</strong> Object to certain processing activities</li>
          <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
        </ul>
        <p style={{ margin: 0 }}>
          To exercise any of these rights, please contact us at the email address below. We will respond to your request within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies & Tracking">
        <p style={{ margin: '0 0 12px' }}>
          We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide essential functionality. Specifically, we use:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li><strong>Essential Cookies:</strong> Required for the Platform to function, including authentication and session management</li>
          <li><strong>Analytics Cookies:</strong> To understand how users interact with the Platform and improve our service</li>
          <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
        </ul>
        <p style={{ margin: 0 }}>
          You can control cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of the Platform.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-Party Services">
        <p style={{ margin: '0' }}>
          Novelify integrates with third-party services to provide core functionality. These include Amazon Web Services (cloud infrastructure), Stripe (payment processing), and OpenAI (AI writing features). Each third-party service has its own privacy policy governing the handling of your data. We encourage you to review their policies. Novelify is not responsible for the privacy practices of these third parties.
        </p>
      </LegalSection>

      <LegalSection title="9. Children&apos;s Privacy">
        <p style={{ margin: 0 }}>
          Novelify is not directed to children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete that information and terminate the account. If you believe a child has provided us with personal data, please contact us immediately.
        </p>
      </LegalSection>

      <LegalSection title="10. International Data Transfers">
        <p style={{ margin: '0 0 12px' }}>
          Your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate. If you are located in the European Economic Area (EEA), the United Kingdom, or other regions with data protection laws, we ensure that appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.
        </p>
        <p style={{ margin: 0 }}>
          By using Novelify, you consent to the transfer of your data to countries that may have different data protection rules than your country of residence.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to This Policy">
        <p style={{ margin: 0 }}>
          We may update this Privacy Policy from time to time. We will notify you of material changes via email or through a prominent notice on the Platform. Your continued use of Novelify after changes take effect constitutes your acceptance of the updated policy.
        </p>
      </LegalSection>

      <ContactSupportBlock />
    </LegalLayout>
  )
}
