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

const TermsOfServiceScreen = () => {
  return (
    <WebScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.lastUpdated}>Last Updated: October 13, 2025</Text>

      <Text style={styles.intro}>
        Welcome to Intentional Movement Corp. By accessing or using our platform, you agree to be
        bound by these Terms of Service. Please read them carefully.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account or using the Intentional Movement platform, you acknowledge that
          you have read, understood, and agree to be bound by these Terms of Service and our
          Privacy Policy. If you do not agree to these terms, please do not use our services.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years old to use our services. By using our platform, you
          represent and warrant that you are at least 18 years of age and have the legal capacity
          to enter into this agreement.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Account Registration</Text>
        <Text style={styles.paragraph}>
          To access certain features, you must create an account. You agree to:
        </Text>
        <Text style={styles.bullet}>• Provide accurate and complete information</Text>
        <Text style={styles.bullet}>• Maintain the security of your account credentials</Text>
        <Text style={styles.bullet}>• Notify us immediately of any unauthorized access</Text>
        <Text style={styles.bullet}>• Be responsible for all activities under your account</Text>
        <Text style={styles.paragraph}>
          You may not share your account with others or allow others to access your account.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Subscription Plans</Text>
        <Text style={styles.paragraph}>
          We offer multiple subscription tiers:
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Free Tier</Text>: Limited access to platform features
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Basic Tier</Text>: Enhanced features including unlimited posts
          and program purchases
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Premium Tier</Text>: Full access to all platform features
        </Text>
        <Text style={styles.paragraph}>
          Paid subscriptions automatically renew unless cancelled before the renewal date. You may
          cancel at any time, and you will retain access until the end of your billing period.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Payment Terms</Text>
        <Text style={styles.paragraph}>
          • All payments are processed securely through Stripe
        </Text>
        <Text style={styles.paragraph}>
          • Subscription fees are charged at the beginning of each billing period
        </Text>
        <Text style={styles.paragraph}>
          • Program purchases are one-time fees unless otherwise specified
        </Text>
        <Text style={styles.paragraph}>
          • Refunds are available within 14 days of purchase for programs, subject to our refund
          policy
        </Text>
        <Text style={styles.paragraph}>
          • We reserve the right to change pricing with 30 days notice
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. User Content</Text>
        <Text style={styles.paragraph}>
          You retain ownership of content you post on our platform. However, by posting content,
          you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify,
          and display your content for the purpose of operating and promoting our services.
        </Text>
        <Text style={styles.paragraph}>
          You agree not to post content that:
        </Text>
        <Text style={styles.bullet}>• Violates any laws or regulations</Text>
        <Text style={styles.bullet}>• Infringes on intellectual property rights</Text>
        <Text style={styles.bullet}>• Contains hate speech, harassment, or discrimination</Text>
        <Text style={styles.bullet}>• Is sexually explicit or pornographic</Text>
        <Text style={styles.bullet}>• Promotes violence or illegal activities</Text>
        <Text style={styles.bullet}>• Contains spam or misleading information</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You may not:
        </Text>
        <Text style={styles.bullet}>• Use our services for any illegal purpose</Text>
        <Text style={styles.bullet}>• Attempt to gain unauthorized access to our systems</Text>
        <Text style={styles.bullet}>• Interfere with or disrupt our services</Text>
        <Text style={styles.bullet}>• Impersonate others or misrepresent your affiliation</Text>
        <Text style={styles.bullet}>• Scrape or harvest data from our platform</Text>
        <Text style={styles.bullet}>• Use bots or automated systems without permission</Text>
        <Text style={styles.bullet}>• Resell or redistribute our content or services</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content provided by Intentional Movement Corp, including programs, courses, logos,
          and branding materials, are protected by copyright, trademark, and other intellectual
          property laws. You may not use our intellectual property without explicit written
          permission.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Program Access</Text>
        <Text style={styles.paragraph}>
          When you purchase a program:
        </Text>
        <Text style={styles.bullet}>• You receive a personal, non-transferable license</Text>
        <Text style={styles.bullet}>
          • Access is granted for personal use only, not commercial use
        </Text>
        <Text style={styles.bullet}>
          • You may not share, reproduce, or redistribute program content
        </Text>
        <Text style={styles.bullet}>
          • We reserve the right to revoke access for violations of these terms
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10. Health Disclaimer</Text>
        <Text style={styles.paragraph}>
          Our fitness and wellness programs are for informational and educational purposes only.
          They are not intended as medical advice or as a substitute for professional medical
          consultation. Always consult with a qualified healthcare provider before beginning any
          exercise or wellness program.
        </Text>
        <Text style={styles.paragraph}>
          You assume all risks associated with following our programs. We are not liable for any
          injuries, health issues, or damages that may result from using our services.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>11. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate your account at any time for:
        </Text>
        <Text style={styles.bullet}>• Violation of these Terms of Service</Text>
        <Text style={styles.bullet}>• Fraudulent or illegal activity</Text>
        <Text style={styles.bullet}>• Abuse of our platform or other users</Text>
        <Text style={styles.bullet}>• Non-payment of fees</Text>
        <Text style={styles.paragraph}>
          Upon termination, you will lose access to all purchased content and any subscription
          benefits. No refunds will be provided for terminations due to violations.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>12. Disclaimers</Text>
        <Text style={styles.paragraph}>
          Our services are provided "as is" without warranties of any kind. We do not guarantee
          that our services will be uninterrupted, error-free, or secure. We disclaim all
          warranties, express or implied, including merchantability and fitness for a particular
          purpose.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>13. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, Intentional Movement Corp shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages arising from
          your use of our services. Our total liability shall not exceed the amount you paid to us
          in the 12 months preceding the claim.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>14. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold harmless Intentional Movement Corp, its officers,
          directors, employees, and agents from any claims, damages, losses, or expenses arising
          from your use of our services or violation of these terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms of Service at any time. We will notify you of material changes
          via email or through the platform. Your continued use of our services after changes
          constitutes acceptance of the new terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>16. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the United
          States, without regard to conflict of law principles. Any disputes shall be resolved in
          the courts located in the United States.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>17. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.paragraph}>
          Email: legal@intentionalmovement.com{'\n'}
          Address: Intentional Movement Corp
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By using our services, you acknowledge that you have read and understood these Terms of
          Service and agree to be bound by them.
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

export default TermsOfServiceScreen;
