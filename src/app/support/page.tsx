import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalPageHeader } from '@/components/legal/legal-page-header'
import { LegalSection } from '@/components/legal/legal-section'
import { ContactSupportBlock } from '@/components/legal/contact-support-block'

export const metadata: Metadata = {
  title: 'Support | Novelify',
  description: 'Get help with Novelify. Find answers to common questions, learn how to contact our support team, and access resources for troubleshooting issues.',
}

export default function SupportPage() {
  return (
    <LegalLayout>
      <LegalPageHeader
        title="Support"
        summary="We&apos;re here to help you get the most out of Novelify. Whether you&apos;re troubleshooting an issue or just have a question, find the support resources you need below."
        lastUpdated="June 1, 2025"
      />

      <LegalSection title="How to Reach Us">
        <p style={{ margin: '0 0 12px' }}>
          Email is the fastest way to get help from our support team:
        </p>
        <p style={{ margin: '0 0 12px' }}>
          <strong>General Support:</strong>{' '}
          <a href="mailto:support@novelify.online" style={{ color: 'var(--novel-gold)', textDecoration: 'none' }}>
            support@novelify.online
          </a>
        </p>
        <p style={{ margin: '0 0 12px' }}>
          <strong>Billing Support:</strong>{' '}
          <a href="mailto:billing@novelify.online" style={{ color: 'var(--novel-gold)', textDecoration: 'none' }}>
            billing@novelify.online
          </a>
        </p>
        <p style={{ margin: 0 }}>
          When emailing support, please include your account email address and a detailed description of your issue to help us resolve it faster.
        </p>
      </LegalSection>

      <LegalSection title="Support Hours">
        <p style={{ margin: '0 0 12px' }}>
          Our support team is available during the following hours:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Monday - Friday: 9:00 AM - 7:00 PM Eastern Time (ET)</li>
          <li>Saturday: 10:00 AM - 4:00 PM ET</li>
          <li>Sunday: Closed</li>
        </ul>
        <p style={{ margin: 0 }}>
          We respond to emails submitted outside of business hours on the next business day. Paid subscribers receive priority response within 4 hours during business hours.
        </p>
      </LegalSection>

      <LegalSection title="Common Topics">
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--novel-text)' }}>Account & Login Issues</p>
        <p style={{ margin: '0 0 12px' }}>
          If you&apos;re having trouble logging in, try resetting your password using the &quot;Forgot Password&quot; link on the login page. If you continue to experience issues, please contact support with your account email.
        </p>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--novel-text)' }}>Subscription & Billing</p>
        <p style={{ margin: '0 0 12px' }}>
          Questions about your subscription plan, billing date, or payment method? Visit your account settings to manage your subscription or contact our billing team for assistance with payment-related issues.
        </p>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--novel-text)' }}>AI Writing Features</p>
        <p style={{ margin: '0 0 12px' }}>
          If AI features are not working as expected, ensure you have an active internet connection and that your usage has not exceeded the rate limits for your plan. For persistent issues, please contact support with details about the feature and behavior you&apos;re experiencing.
        </p>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--novel-text)' }}>Lost or Missing Content</p>
        <p style={{ margin: '0' }}>
          Novelify automatically saves your work as you write. If you believe content is missing, check your project&apos;s version history (available in the project settings menu). Automated backups are retained for 30 days. Contact support if you need assistance restoring from a backup.
        </p>
      </LegalSection>

      <LegalSection title="Self-Help Resources">
        <p style={{ margin: '0 0 12px' }}>
          Before reaching out to support, you may find answers to common questions in the following places:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li><strong>Knowledge Base:</strong> Browse our library of help articles and tutorials accessible from your dashboard</li>
          <li><strong>FAQ:</strong> Check our Frequently Asked Questions section for quick answers to common questions</li>
          <li><strong>Release Notes:</strong> Stay up to date with the latest features and improvements</li>
        </ul>
        <p style={{ margin: 0 }}>
          These resources are available to all users and are updated regularly with new information.
        </p>
      </LegalSection>

      <LegalSection title="Report a Bug">
        <p style={{ margin: '0 0 12px' }}>
          If you&apos;ve encountered a bug or technical issue, please report it to our support team with the following details:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>A clear description of the issue and what you expected to happen</li>
          <li>Steps to reproduce the problem</li>
          <li>Your browser type and version</li>
          <li>Any error messages or screenshots</li>
          <li>The approximate time the issue occurred</li>
        </ul>
        <p style={{ margin: 0 }}>
          Providing these details helps us diagnose and resolve issues more quickly.
        </p>
      </LegalSection>

      <LegalSection title="Feature Requests">
        <p style={{ margin: '0' }}>
          We welcome feedback and suggestions for improving Novelify. To submit a feature request, please email us at <a href="mailto:support@novelify.online" style={{ color: 'var(--novel-gold)', textDecoration: 'none' }}>support@novelify.online</a> with &quot;Feature Request&quot; in the subject line. While we cannot guarantee implementation, we review all suggestions and consider them for future development.
        </p>
      </LegalSection>

      <ContactSupportBlock />
    </LegalLayout>
  )
}
