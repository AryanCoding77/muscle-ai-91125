import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../config/constants';

export const TermsConditionsScreen = ({ navigation }: any) => {
  const handleGoBack = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#A67C52', '#8B4513', '#2F1B14', '#1A1A1A', '#0F0F0F', '#0A0A0A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.lastUpdated}>Last updated: October 27, 2025</Text>
            
            <Text style={styles.sectionText}>
              Please read these Terms and Conditions carefully before using the Muscle AI mobile application. By accessing or using the app, you agree to be bound by these Terms.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By creating an account and using Muscle AI, you confirm that you:
              </Text>
              <Text style={styles.bulletPoint}>• Are at least 13 years of age</Text>
              <Text style={styles.bulletPoint}>• Have the legal capacity to enter into binding contracts</Text>
              <Text style={styles.bulletPoint}>• Agree to comply with these Terms and all applicable laws</Text>
              <Text style={styles.bulletPoint}>• Accept our Privacy Policy</Text>
              <Text style={styles.sectionText}>
                If you do not agree with any part of these Terms, you must not use the app.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Service Description</Text>
              <Text style={styles.sectionText}>
                Muscle AI provides AI-powered muscle analysis and fitness tracking services including:
              </Text>
              <Text style={styles.bulletPoint}>• AI-based muscle development analysis from uploaded photos</Text>
              <Text style={styles.bulletPoint}>• Progress tracking and historical analysis comparison</Text>
              <Text style={styles.bulletPoint}>• Personalized workout recommendations</Text>
              <Text style={styles.bulletPoint}>• Streak tracking and achievement system</Text>
              <Text style={styles.bulletPoint}>• Subscription-based access to premium features</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Account</Text>
              <Text style={styles.sectionText}>
                To use Muscle AI, you must create an account via Google OAuth. You agree to:
              </Text>
              <Text style={styles.bulletPoint}>• Provide accurate and current information</Text>
              <Text style={styles.bulletPoint}>• Maintain the security of your account credentials</Text>
              <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized access</Text>
              <Text style={styles.bulletPoint}>• Accept responsibility for all activities under your account</Text>
              <Text style={styles.bulletPoint}>• Not share your account with others</Text>
              <Text style={styles.sectionText}>
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Subscription Plans and Billing</Text>
              <Text style={styles.sectionText}>
                Muscle AI offers three subscription tiers:
              </Text>
              <Text style={styles.bulletPoint}>• Basic Plan: $4/month - 5 analyses per month</Text>
              <Text style={styles.bulletPoint}>• Pro Plan: $7/month - 20 analyses per month</Text>
              <Text style={styles.bulletPoint}>• VIP Plan: $14/month - 50 analyses per month</Text>
              <Text style={styles.sectionText}>
                Subscription Terms:
              </Text>
              <Text style={styles.bulletPoint}>• Billing is handled by Razorpay, our payment processor</Text>
              <Text style={styles.bulletPoint}>• Subscriptions automatically renew monthly unless cancelled</Text>
              <Text style={styles.bulletPoint}>• Monthly usage resets at the start of each billing cycle</Text>
              <Text style={styles.bulletPoint}>• Unused analyses do not roll over to the next month</Text>
              <Text style={styles.bulletPoint}>• Changes take effect at the next billing cycle</Text>
              <Text style={styles.bulletPoint}>• All prices are in USD and subject to change with 30 days notice</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Cancellation and Refunds</Text>
              <Text style={styles.sectionText}>
                You may cancel your subscription at any time from the app's subscription management screen. Upon cancellation:
              </Text>
              <Text style={styles.bulletPoint}>• You will lose access to the plan as soon as you cancel the subscription</Text>
              <Text style={styles.bulletPoint}>• No refunds are provided for partial months</Text>
              <Text style={styles.bulletPoint}>• Your analysis history remains accessible</Text>
              <Text style={styles.bulletPoint}>• You can resubscribe at any time</Text>
              <Text style={styles.sectionText}>
                We reserve the right to refuse refunds except as required by law or in cases of service failure on our part.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. AI Analysis and Medical Disclaimer</Text>
              <Text style={styles.sectionText}>
                IMPORTANT: Muscle AI is NOT a medical device and should NOT be used for medical diagnosis:
              </Text>
              <Text style={styles.bulletPoint}>• Our AI analysis is for informational and fitness tracking purposes only</Text>
              <Text style={styles.bulletPoint}>• Results are estimates and may not be 100% accurate</Text>
              <Text style={styles.bulletPoint}>• Do not use our analysis to diagnose medical conditions</Text>
              <Text style={styles.bulletPoint}>• Consult healthcare professionals before starting any fitness program</Text>
              <Text style={styles.bulletPoint}>• We are not liable for injuries resulting from following recommendations</Text>
              <Text style={styles.bulletPoint}>• Analysis accuracy depends on photo quality and consistency</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. User Content and Photos</Text>
              <Text style={styles.sectionText}>
                When you upload photos to Muscle AI:
              </Text>
              <Text style={styles.bulletPoint}>• You retain all rights to your photos</Text>
              <Text style={styles.bulletPoint}>• You grant us a license to process, store, and analyze your photos</Text>
              <Text style={styles.bulletPoint}>• You confirm you have the right to upload the photos</Text>
              <Text style={styles.bulletPoint}>• You agree not to upload inappropriate, offensive, or illegal content</Text>
              <Text style={styles.bulletPoint}>• You can delete your photos at any time</Text>
              <Text style={styles.bulletPoint}>• We do not claim ownership of your content</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Prohibited Uses</Text>
              <Text style={styles.sectionText}>
                You agree NOT to:
              </Text>
              <Text style={styles.bulletPoint}>• Use the app for any unlawful purpose</Text>
              <Text style={styles.bulletPoint}>• Attempt to reverse engineer, decompile, or hack the app</Text>
              <Text style={styles.bulletPoint}>• Upload malicious code or viruses</Text>
              <Text style={styles.bulletPoint}>• Abuse the API or attempt to exceed usage limits</Text>
              <Text style={styles.bulletPoint}>• Upload photos of other people without their consent</Text>
              <Text style={styles.bulletPoint}>• Use the app to harass, abuse, or harm others</Text>
              <Text style={styles.bulletPoint}>• Share or resell access to your account</Text>
              <Text style={styles.bulletPoint}>• Scrape or collect data from the app using automated means</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
              <Text style={styles.sectionText}>
                All content, features, and functionality of Muscle AI are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not:
              </Text>
              <Text style={styles.bulletPoint}>• Copy, modify, or distribute our software or content</Text>
              <Text style={styles.bulletPoint}>• Use our trademarks or branding without permission</Text>
              <Text style={styles.bulletPoint}>• Create derivative works based on our app</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Service Availability</Text>
              <Text style={styles.sectionText}>
                We strive to provide reliable service but cannot guarantee:
              </Text>
              <Text style={styles.bulletPoint}>• Uninterrupted or error-free operation</Text>
              <Text style={styles.bulletPoint}>• That defects will be corrected immediately</Text>
              <Text style={styles.bulletPoint}>• Compatibility with all devices or operating systems</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify, suspend, or discontinue any part of the service with reasonable notice.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
              <Text style={styles.sectionText}>
                To the maximum extent permitted by law, Muscle AI shall not be liable for:
              </Text>
              <Text style={styles.bulletPoint}>• Indirect, incidental, or consequential damages</Text>
              <Text style={styles.bulletPoint}>• Loss of profits, data, or business opportunities</Text>
              <Text style={styles.bulletPoint}>• Injuries resulting from fitness activities</Text>
              <Text style={styles.bulletPoint}>• Inaccurate AI analysis results</Text>
              <Text style={styles.bulletPoint}>• Unauthorized access to your account</Text>
              <Text style={styles.bulletPoint}>• Third-party service failures (Supabase, Razorpay, etc.)</Text>
              <Text style={styles.sectionText}>
                Our total liability shall not exceed the amount you paid in the last 12 months.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Privacy Policy</Text>
              <Text style={styles.sectionText}>
                Your use of Muscle AI is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your information.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account immediately, without notice, if you:
              </Text>
              <Text style={styles.bulletPoint}>• Violate these Terms</Text>
              <Text style={styles.bulletPoint}>• Engage in fraudulent activity</Text>
              <Text style={styles.bulletPoint}>• Abuse the service or other users</Text>
              <Text style={styles.sectionText}>
                Upon termination, your right to use the app ceases immediately. You may request account deletion at any time.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>14. Modifications to Terms</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify these Terms at any time. We will notify you of material changes via:
              </Text>
              <Text style={styles.bulletPoint}>• In-app notification</Text>
              <Text style={styles.bulletPoint}>• Email to your registered address</Text>
              <Text style={styles.bulletPoint}>• Updated "Last updated" date</Text>
              <Text style={styles.sectionText}>
                Continued use of the app after changes constitutes acceptance of the new Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>15. Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration, except where prohibited by law.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>16. Contact Information</Text>
              <Text style={styles.sectionText}>
                For questions about these Terms and Conditions, please contact us at:
              </Text>
              <Text style={styles.contactInfo}>Email: legal@muscleai.com</Text>
              <Text style={styles.contactInfo}>Support: support@muscleai.com</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionText}>
                By using Muscle AI, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  contentContainer: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 5,
    paddingLeft: 10,
  },
  contactInfo: {
    fontSize: 14,
    color: '#50C878',
    lineHeight: 20,
    marginBottom: 5,
    fontWeight: '500',
  },
});
