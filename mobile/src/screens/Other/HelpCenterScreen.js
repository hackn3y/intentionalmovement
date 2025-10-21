import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import api from '../../services/api';

const HelpCenterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const faqs = [
    {
      id: 1,
      question: 'How do I purchase a program?',
      answer: 'Navigate to the Programs tab, select the program you want, and tap "Purchase". You\'ll be guided through the secure checkout process.',
    },
    {
      id: 2,
      question: 'How do I change my membership plan?',
      answer: 'Go to Settings → Membership to view and change your current plan. You can upgrade or downgrade at any time.',
    },
    {
      id: 3,
      question: 'Can I cancel my membership?',
      answer: 'Yes, you can cancel your membership anytime from Settings → Membership. You\'ll continue to have access until the end of your billing period.',
    },
    {
      id: 4,
      question: 'How do I reset my password?',
      answer: 'Go to Settings → Change Password. You\'ll need to enter your current password and choose a new one.',
    },
    {
      id: 5,
      question: 'How do I delete my account?',
      answer: 'Please contact our support team at support@intentionalmovementcorp.com to request account deletion. We\'ll process your request within 7 business days.',
    },
    {
      id: 6,
      question: 'How do I report inappropriate content?',
      answer: 'Tap the three dots (...) on any post and select "Report". Our moderation team will review the content.',
    },
    {
      id: 7,
      question: 'Are my payments secure?',
      answer: 'Yes! We use Stripe for payment processing, which is PCI-DSS compliant and uses industry-leading security standards.',
    },
    {
      id: 8,
      question: 'How do I contact support?',
      answer: 'You can reach us via the contact form below, email us at support@intentionalmovementcorp.com, or check out our social media channels.',
    },
  ];

  const quickLinks = [
    {
      id: 1,
      title: 'Email Support',
      subtitle: 'support@intentionalmovementcorp.com',
      action: () => Linking.openURL('mailto:support@intentionalmovementcorp.com'),
    },
    {
      id: 2,
      title: 'Visit Our Website',
      subtitle: 'intentionalmovementcorporation.com',
      action: () => Linking.openURL('https://intentionalmovementcorporation.com'),
    },
    {
      id: 3,
      title: 'Terms of Service',
      subtitle: 'Read our terms',
      action: () => navigation.navigate('TermsOfService'),
    },
    {
      id: 4,
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      action: () => navigation.navigate('PrivacyPolicy'),
    },
  ];

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await api.post('/support/contact', {
        subject,
        message,
        userEmail: user?.email,
        userName: user?.displayName || user?.username,
      });

      if (Platform.OS === 'web') {
        window.alert('Message sent successfully! We\'ll get back to you soon.');
      } else {
        Alert.alert('Success', 'Message sent successfully! We\'ll get back to you soon.');
      }

      setSubject('');
      setMessage('');
      setShowContactForm(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again or email us directly.';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSending(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Help Center</Text>
        <Text style={styles.description}>
          Find answers to common questions or contact our support team
        </Text>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.linkItem}
              onPress={link.action}
            >
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Text style={styles.faqIcon}>{expandedFAQ === faq.id ? '−' : '+'}</Text>
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.contactFormHeader}
            onPress={() => setShowContactForm(!showContactForm)}
          >
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.faqIcon}>{showContactForm ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showContactForm && (
            <View style={styles.contactForm}>
              <Text style={styles.formLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief description of your issue"
                placeholderTextColor={colors.gray[400]}
              />

              <Text style={styles.formLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.sendButton, sending && styles.buttonDisabled]}
                onPress={handleSendMessage}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.sendButtonText}>Send Message</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.contactNote}>
                We typically respond within 24-48 hours
              </Text>
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Intentional Movement Corp</Text>
          <Text style={styles.footerText}>Version 1.0.2</Text>
          <Text style={styles.footerSubtext}>
            Elevate Your LifeStyle
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.gray[50],
    },
    content: {
      padding: SIZES.lg,
    },
    header: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700',
      color: colors.dark,
      marginBottom: SIZES.sm,
    },
    description: {
      fontSize: FONT_SIZES.md,
      color: colors.gray[600],
      marginBottom: SIZES.xl,
    },
    section: {
      backgroundColor: colors.white,
      borderRadius: SIZES.sm,
      padding: SIZES.md,
      marginBottom: SIZES.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
      color: colors.dark,
      marginBottom: SIZES.md,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    linkInfo: {
      flex: 1,
    },
    linkTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '500',
      color: colors.dark,
    },
    linkSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      marginTop: 2,
    },
    arrow: {
      fontSize: FONT_SIZES.xxl,
      color: colors.gray[400],
      fontWeight: '300',
    },
    faqItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
      marginBottom: SIZES.sm,
    },
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.md,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: FONT_SIZES.md,
      fontWeight: '500',
      color: colors.dark,
    },
    faqIcon: {
      fontSize: FONT_SIZES.xl,
      fontWeight: '400',
      color: colors.primary,
      marginLeft: SIZES.md,
    },
    faqAnswer: {
      paddingBottom: SIZES.md,
      paddingRight: SIZES.lg,
    },
    faqAnswerText: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[700],
      lineHeight: 20,
    },
    contactFormHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    contactForm: {
      marginTop: SIZES.md,
    },
    formLabel: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.dark,
      marginBottom: SIZES.sm,
      marginTop: SIZES.sm,
    },
    input: {
      backgroundColor: colors.gray[50],
      borderRadius: SIZES.sm,
      borderWidth: 1,
      borderColor: colors.gray[300],
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.md,
      fontSize: FONT_SIZES.md,
      color: colors.dark,
    },
    textArea: {
      height: 120,
      paddingTop: SIZES.md,
    },
    sendButton: {
      backgroundColor: colors.primary,
      paddingVertical: SIZES.md,
      borderRadius: SIZES.sm,
      alignItems: 'center',
      marginTop: SIZES.lg,
    },
    sendButtonText: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    contactNote: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      textAlign: 'center',
      marginTop: SIZES.sm,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: SIZES.xl,
      marginTop: SIZES.lg,
    },
    footerText: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      marginBottom: SIZES.xs,
    },
    footerSubtext: {
      fontSize: FONT_SIZES.xs,
      color: colors.gray[500],
      fontStyle: 'italic',
      marginTop: SIZES.xs,
    },
  });

export default HelpCenterScreen;
