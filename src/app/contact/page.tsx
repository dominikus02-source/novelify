import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalPageHeader } from '@/components/legal/legal-page-header'
import { LegalSection } from '@/components/legal/legal-section'
import { ContactSupportBlock } from '@/components/legal/contact-support-block'

export const metadata: Metadata = {
  title: 'Contact Us | Novelify',
  description: 'Get in touch with the Novelify team. Find our email addresses for general inquiries, billing support, and privacy-related requests.',
}

export default function ContactPage() {
  return (
    <LegalLayout>
      <LegalPageHeader
        title="Contact Us"
        summary="We&apos;d love to hear from you. Whether you have a question, feedback, or need assistance, here are the best ways to reach the Novelify team."
        lastUpdated="June 1, 2025"
      />

      <LegalSection title="General Inquiries">
        <p style={{ margin: '0 0 12px' }}>
          For general questions about Novelify, feature requests, partnership opportunities, or press inquiries, please reach out to our team:
        </p>
        <p style={{ margin: 0 }}>
          <strong>Email:</strong>{' '}
          <a href="mailto:hello@novelify.online" style={{ color: '#C9A96E', textDecoration: 'none' }}>
            hello@novelify.online
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Technical Support">
        <p style={{ margin: '0 0 12px' }}>
          Experiencing a technical issue or bug? Our support team is here to help:
        </p>
        <p style={{ margin: '0 0 12px' }}>
          <strong>Email:</strong>{' '}
          <a href="mailto:support@novelify.online" style={{ color: '#C9A96E', textDecoration: 'none' }}>
            support@novelify.online
          </a>
        </p>
        <p style={{ margin: 0 }}>
          For the fastest resolution, please include your account email, a description of the issue, and any relevant screenshots or error messages.
        </p>
      </LegalSection>

      <LegalSection title="Billing & Payments">
        <p style={{ margin: '0 0 12px' }}>
          For billing inquiries, payment issues, or refund requests, contact our billing team:
        </p>
        <p style={{ margin: 0 }}>
          <strong>Email:</strong>{' '}
          <a href="mailto:billing@novelify.online" style={{ color: '#C9A96E', textDecoration: 'none' }}>
            billing@novelify.online
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Privacy & Data Requests">
        <p style={{ margin: '0 0 12px' }}>
          For privacy-related questions, data access requests, or account deletion requests:
        </p>
        <p style={{ margin: 0 }}>
          <strong>Email:</strong>{' '}
          <a href="mailto:privacy@novelify.online" style={{ color: '#C9A96E', textDecoration: 'none' }}>
            privacy@novelify.online
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Response Times">
        <p style={{ margin: '0 0 12px' }}>
          We strive to respond to all inquiries within the following timeframes:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>General inquiries: within 24 hours</li>
          <li>Technical support: within 12 hours (priority for paid subscribers)</li>
          <li>Billing inquiries: within 24 hours</li>
          <li>Privacy requests: within 30 days (as required by law)</li>
        </ul>
        <p style={{ margin: 0 }}>
          Our team operates Monday through Friday, excluding major US holidays. Responses may be delayed on weekends and holidays.
        </p>
      </LegalSection>

      <LegalSection title="Mailing Address">
        <p style={{ margin: 0 }}>
          Novelify Inc.<br />
          100 Innovation Drive, Suite 300<br />
          Wilmington, DE 19801<br />
          United States
        </p>
      </LegalSection>

      <ContactSupportBlock />
    </LegalLayout>
  )
}
