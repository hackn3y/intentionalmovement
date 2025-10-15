import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WebScrollView from '../../components/WebScrollView';

const COLORS = {
  primary: '#ec4899',
  light: '#fdf2f8',
  white: '#ffffff',
  dark: '#1f2937',
  gray: '#6b7280',
};

const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const PrivacyPolicyScreen = () => {
  return (
    <WebScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last Updated: October 13, 2025</Text>

      <Text style={styles.intro}>
        At Intentional Movement Corp, we are committed to protecting your privacy and personal
        information. This Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our platform.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>

        <Text style={styles.subsectionTitle}>Personal Information</Text>
        <Text style={styles.paragraph}>
          When you create an account, we collect:
        </Text>
        <Text style={styles.bullet}>• Email address</Text>
        <Text style={styles.bullet}>• Username and display name</Text>
        <Text style={styles.bullet}>• Password (encrypted)</Text>
        <Text style={styles.bullet}>• Profile picture and cover image (optional)</Text>
        <Text style={styles.bullet}>• Bio and movement goals (optional)</Text>

        <Text style={styles.subsectionTitle}>Payment Information</Text>
        <Text style={styles.paragraph}>
          When you make a purchase or subscribe:
        </Text>
        <Text style={styles.bullet}>• Payment card information (processed by Stripe)</Text>
        <Text style={styles.bullet}>• Billing address</Text>
        <Text style={styles.bullet}>• Transaction history</Text>
        <Text style={styles.paragraph}>
          Note: We do not store your full credit card information. All payment processing is
          handled securely by Stripe, our PCI-compliant payment processor.
        </Text>

        <Text style={styles.subsectionTitle}>Usage Information</Text>
        <Text style={styles.paragraph}>
          We automatically collect information about how you use our platform:
        </Text>
        <Text style={styles.bullet}>• Posts, comments, and likes</Text>
        <Text style={styles.bullet}>• Programs viewed and purchased</Text>
        <Text style={styles.bullet}>• Progress and completion data</Text>
        <Text style={styles.bullet}>• Messages sent and received</Text>
        <Text style={styles.bullet}>• Login activity and timestamps</Text>

        <Text style={styles.subsectionTitle}>Device Information</Text>
        <Text style={styles.paragraph}>
          We collect information about the device you use to access our services:
        </Text>
        <Text style={styles.bullet}>• Device type and operating system</Text>
        <Text style={styles.bullet}>• Browser type and version</Text>
        <Text style={styles.bullet}>• IP address and location data</Text>
        <Text style={styles.bullet}>• Device identifiers</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Provide Services</Text>: Deliver and maintain our platform
          features
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Process Payments</Text>: Handle subscriptions and program
          purchases
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Personalize Experience</Text>: Recommend content and programs
          based on your interests
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Communicate</Text>: Send notifications, updates, and
          marketing communications
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Improve Services</Text>: Analyze usage patterns to enhance
          our platform
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Ensure Security</Text>: Detect and prevent fraud, abuse, and
          security incidents
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Comply with Law</Text>: Meet legal obligations and enforce
          our terms
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information. We may share your information with:
        </Text>

        <Text style={styles.subsectionTitle}>Service Providers</Text>
        <Text style={styles.bullet}>• Stripe (payment processing)</Text>
        <Text style={styles.bullet}>• Firebase (authentication and push notifications)</Text>
        <Text style={styles.bullet}>• AWS (cloud hosting and storage)</Text>
        <Text style={styles.bullet}>• Mixpanel (analytics)</Text>
        <Text style={styles.bullet}>• Vimeo (video hosting)</Text>

        <Text style={styles.subsectionTitle}>Other Users</Text>
        <Text style={styles.paragraph}>
          Your public profile information, posts, and comments are visible to other users as part
          of the social features of our platform.
        </Text>

        <Text style={styles.subsectionTitle}>Legal Requirements</Text>
        <Text style={styles.paragraph}>
          We may disclose information if required by law, court order, or government request, or
          to protect our rights and safety.
        </Text>

        <Text style={styles.subsectionTitle}>Business Transfers</Text>
        <Text style={styles.paragraph}>
          If we are involved in a merger, acquisition, or sale of assets, your information may be
          transferred as part of that transaction.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to protect your information:
        </Text>
        <Text style={styles.bullet}>• Encryption of data in transit (HTTPS/TLS)</Text>
        <Text style={styles.bullet}>• Encrypted password storage (bcrypt hashing)</Text>
        <Text style={styles.bullet}>• Secure cloud infrastructure (AWS)</Text>
        <Text style={styles.bullet}>• Regular security audits and updates</Text>
        <Text style={styles.bullet}>• Access controls and authentication</Text>
        <Text style={styles.paragraph}>
          However, no method of transmission over the internet is 100% secure. While we strive to
          protect your information, we cannot guarantee absolute security.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Your Privacy Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your location, you may have the following rights:
        </Text>

        <Text style={styles.subsectionTitle}>Access and Portability</Text>
        <Text style={styles.paragraph}>
          Request a copy of your personal data in a structured, machine-readable format.
        </Text>

        <Text style={styles.subsectionTitle}>Correction</Text>
        <Text style={styles.paragraph}>
          Update or correct inaccurate personal information through your account settings.
        </Text>

        <Text style={styles.subsectionTitle}>Deletion</Text>
        <Text style={styles.paragraph}>
          Request deletion of your account and personal data, subject to legal retention
          requirements.
        </Text>

        <Text style={styles.subsectionTitle}>Opt-Out</Text>
        <Text style={styles.paragraph}>
          Unsubscribe from marketing emails or disable push notifications through your settings.
        </Text>

        <Text style={styles.subsectionTitle}>Restriction</Text>
        <Text style={styles.paragraph}>
          Request that we limit how we use your personal information.
        </Text>

        <Text style={styles.paragraph}>
          To exercise these rights, contact us at privacy@intentionalmovement.com
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar tracking technologies to:
        </Text>
        <Text style={styles.bullet}>• Remember your preferences and settings</Text>
        <Text style={styles.bullet}>• Analyze usage patterns and improve our services</Text>
        <Text style={styles.bullet}>• Provide personalized content and recommendations</Text>
        <Text style={styles.bullet}>• Measure the effectiveness of marketing campaigns</Text>
        <Text style={styles.paragraph}>
          You can control cookies through your browser settings, but disabling them may affect
          functionality.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Third-Party Links</Text>
        <Text style={styles.paragraph}>
          Our platform may contain links to third-party websites or services. We are not
          responsible for the privacy practices of these external sites. We encourage you to
          review their privacy policies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for children under 18. We do not knowingly collect
          personal information from children. If you believe we have collected information from a
          child, please contact us immediately.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and processed in countries other than your own.
          We ensure appropriate safeguards are in place to protect your data in accordance with
          applicable laws.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as necessary to:
        </Text>
        <Text style={styles.bullet}>• Provide our services to you</Text>
        <Text style={styles.bullet}>• Comply with legal obligations</Text>
        <Text style={styles.bullet}>• Resolve disputes and enforce agreements</Text>
        <Text style={styles.bullet}>• Maintain business records</Text>
        <Text style={styles.paragraph}>
          When you delete your account, we will delete or anonymize your personal information
          within 30 days, except where we are required to retain it by law.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>11. California Privacy Rights (CCPA)</Text>
        <Text style={styles.paragraph}>
          If you are a California resident, you have additional rights under the California
          Consumer Privacy Act (CCPA):
        </Text>
        <Text style={styles.bullet}>• Right to know what personal information is collected</Text>
        <Text style={styles.bullet}>• Right to know if personal information is sold or disclosed</Text>
        <Text style={styles.bullet}>• Right to opt-out of the sale of personal information</Text>
        <Text style={styles.bullet}>• Right to deletion</Text>
        <Text style={styles.bullet}>• Right to non-discrimination for exercising your rights</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information to third parties.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>12. European Privacy Rights (GDPR)</Text>
        <Text style={styles.paragraph}>
          If you are in the European Economic Area, you have rights under the General Data
          Protection Regulation (GDPR), including the rights listed in Section 5, plus:
        </Text>
        <Text style={styles.bullet}>• Right to object to processing</Text>
        <Text style={styles.bullet}>• Right to withdraw consent</Text>
        <Text style={styles.bullet}>• Right to lodge a complaint with a supervisory authority</Text>
        <Text style={styles.paragraph}>
          Our legal basis for processing your data includes consent, contract performance,
          legitimate interests, and legal obligations.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>13. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by:
        </Text>
        <Text style={styles.bullet}>• Posting the new policy on our platform</Text>
        <Text style={styles.bullet}>• Updating the "Last Updated" date</Text>
        <Text style={styles.bullet}>• Sending you an email notification</Text>
        <Text style={styles.paragraph}>
          Your continued use of our services after changes constitutes acceptance of the updated
          policy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions or concerns about this Privacy Policy or our data practices,
          please contact us:
        </Text>
        <Text style={styles.paragraph}>
          Email: privacy@intentionalmovement.com{'\n'}
          Data Protection Officer: dpo@intentionalmovement.com{'\n'}
          Address: Intentional Movement Corp
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By using our services, you acknowledge that you have read and understood this Privacy
          Policy and consent to our collection, use, and disclosure of your information as
          described herein.
        </Text>
      </View>
    </WebScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl * 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.xxl,
  },
  intro: {
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SIZES.xl,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.md,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.dark,
    lineHeight: 22,
    marginBottom: SIZES.md,
  },
  bullet: {
    fontSize: 15,
    color: COLORS.dark,
    lineHeight: 22,
    marginBottom: SIZES.sm,
    paddingLeft: SIZES.md,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: SIZES.xl,
    padding: SIZES.lg,
    backgroundColor: COLORS.light,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;
