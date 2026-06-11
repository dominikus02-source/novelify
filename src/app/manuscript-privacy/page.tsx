import { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalPageHeader } from '@/components/legal/legal-page-header'
import { LegalSection } from '@/components/legal/legal-section'
import { ContactSupportBlock } from '@/components/legal/contact-support-block'

export const metadata: Metadata = {
  title: 'Manuscript Privacy | Novelify',
  description: 'Learn how Novelify protects your manuscripts and creative content with encryption, access controls, and industry-standard security practices.',
}

export default function ManuscriptPrivacyPage() {
  return (
    <LegalLayout>
      <LegalPageHeader
        title="Manuscript Privacy"
        summary="Your manuscripts and creative works are your intellectual property. This policy details the measures we take to protect the privacy and security of your content on Novelify."
        lastUpdated="June 1, 2025"
      />

      <LegalSection title="1. Your Content Is Yours">
        <p style={{ margin: '0 0 12px' }}>
          Novelify respects your ownership of all manuscripts, outlines, characters, notes, and any other creative content you create or upload to the Platform. We do not claim any ownership rights over your work.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          Your content is stored securely and is accessible only to you and those you explicitly authorize. We do not share, sell, or distribute your manuscripts to third parties.
        </p>
        <p style={{ margin: 0 }}>
          This commitment to your privacy is fundamental to our service. You write freely, knowing your creative work remains confidential.
        </p>
      </LegalSection>

      <LegalSection title="2. Encryption & Data Protection">
        <p style={{ margin: '0 0 12px' }}>
          All manuscript data is protected using industry-standard encryption:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li><strong>In Transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.3 (Transport Layer Security), ensuring that your content cannot be intercepted during transmission</li>
          <li><strong>At Rest:</strong> All stored content is encrypted using AES-256 encryption at the storage level</li>
          <li><strong>Backups:</strong> Encrypted backups are performed regularly to prevent data loss</li>
        </ul>
        <p style={{ margin: 0 }}>
          These encryption standards are consistent with those used by financial institutions and healthcare providers.
        </p>
      </LegalSection>

      <LegalSection title="3. Access Controls">
        <p style={{ margin: '0 0 12px' }}>
          Access to your manuscripts is strictly controlled:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Only you can access your account and content using your email and password</li>
          <li>Novelify employees and contractors do not have direct access to your manuscripts. In rare cases where access is required for technical support or troubleshooting (with your explicit consent), such access is logged, time-limited, and audited</li>
          <li>Two-factor authentication (2FA) is available for enhanced account security</li>
          <li>Session management features allow you to view and revoke active sessions</li>
        </ul>
        <p style={{ margin: 0 }}>
          You are responsible for maintaining the security of your account credentials. We strongly recommend using a strong, unique password and enabling two-factor authentication.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Segregation">
        <p style={{ margin: '0 0 12px' }}>
          Each Novelify account operates in an isolated environment. Your manuscripts are stored in a logically segregated database partition, ensuring that no other user can access your content. Our infrastructure is designed with strict multi-tenancy controls to prevent cross-account data access.
        </p>
        <p style={{ margin: 0 }}>
          Regular security audits and penetration testing verify the effectiveness of these isolation measures.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Deletion & Retention">
        <p style={{ margin: '0 0 12px' }}>
          You have full control over your content:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>You may delete individual manuscripts or your entire account at any time</li>
          <li>Deleted manuscripts are moved to a &quot;trash&quot; folder for 30 days, after which they are permanently deleted</li>
          <li>Upon account deletion, all your content is permanently deleted from our servers within 30 days</li>
          <li>Backups containing deleted data are overwritten within 90 days</li>
        </ul>
        <p style={{ margin: 0 }}>
          We retain the minimum amount of data necessary for legal and operational purposes (e.g., billing records), which does not include your manuscripts or creative content.
        </p>
      </LegalSection>

      <LegalSection title="6. AI Processing & Manuscript Data">
        <p style={{ margin: '0 0 12px' }}>
          When you use AI writing features, portions of your manuscript or context may be sent to our AI service provider for processing. This data is:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Used only to generate the requested AI output</li>
          <li>Not retained by the AI provider beyond the processing request (typically seconds)</li>
          <li>Not used to train or improve AI models</li>
          <li>Transmitted over encrypted connections</li>
        </ul>
        <p style={{ margin: 0 }}>
          We have contractual safeguards with our AI providers to ensure your manuscript data is never used for purposes beyond providing the service to you.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-Party Access">
        <p style={{ margin: '0 0 12px' }}>
          We do not sell access to your manuscripts to any third party. Limited content access may be granted to:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li><strong>Infrastructure providers:</strong> AWS hosts our data with strict access controls and SOC 2 compliance</li>
          <li><strong>AI providers:</strong> As described above, with strict data processing agreements in place</li>
          <li><strong>Legal authorities:</strong> Only when required by valid legal process, such as a court order or subpoena</li>
        </ul>
        <p style={{ margin: 0 }}>
          In the event of a legal request for your data, we will notify you to the extent permitted by law and challenge overly broad requests.
        </p>
      </LegalSection>

      <LegalSection title="8. Security Incident Response">
        <p style={{ margin: '0 0 12px' }}>
          In the unlikely event of a security incident affecting your manuscripts, we will:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Notify you within 72 hours of discovering the incident</li>
          <li>Provide details about the nature and scope of the breach</li>
          <li>Take immediate steps to contain and remediate the issue</li>
          <li>Cooperate with relevant authorities as required by law</li>
        </ul>
        <p style={{ margin: 0 }}>
          We maintain a comprehensive incident response plan and conduct regular security drills to ensure preparedness.
        </p>
      </LegalSection>

      <LegalSection title="9. Best Practices for Users">
        <p style={{ margin: '0 0 12px' }}>
          While we implement extensive security measures, your actions also play a role in protecting your manuscripts. We recommend:
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>Using a strong, unique password for your Novelify account</li>
          <li>Enabling two-factor authentication</li>
          <li>Not sharing your account credentials with others</li>
          <li>Logging out of Novelify on shared or public devices</li>
          <li>Regularly backing up important manuscripts outside the Platform</li>
        </ul>
        <p style={{ margin: 0 }}>
          Following these practices significantly reduces the risk of unauthorized access to your creative work.
        </p>
      </LegalSection>

      <ContactSupportBlock />
    </LegalLayout>
  )
}
