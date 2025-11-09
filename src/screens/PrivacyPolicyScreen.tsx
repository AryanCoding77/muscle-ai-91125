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

export const PrivacyPolicyScreen = ({ navigation }: any) => {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.lastUpdated}>Last updated: October 27, 2025</Text>
            
            <Text style={styles.sectionText}>
              Welcome to Muscle AI. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this privacy policy carefully.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect information that you provide directly to us when using Muscle AI:
              </Text>
              <Text style={styles.bulletPoint}>• Account Information: Email address, name, username, and profile picture (from Google OAuth)</Text>
              <Text style={styles.bulletPoint}>• Body Analysis Images: Photos you upload for muscle analysis are temporarily processed and then stored securely</Text>
              <Text style={styles.bulletPoint}>• Analysis Results: AI-generated muscle analysis data, scores, and recommendations</Text>
              <Text style={styles.bulletPoint}>• Progress Data: Historical analysis data, streak information, and achievement records</Text>
              <Text style={styles.bulletPoint}>• Subscription Information: Payment details processed through Razorpay, subscription plan, billing cycle, and usage metrics</Text>
              <Text style={styles.bulletPoint}>• Device Information: Device type, operating system, app version, and crash reports</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use the collected information for the following purposes:
              </Text>
              <Text style={styles.bulletPoint}>• To provide AI-powered muscle analysis using our vision models</Text>
              <Text style={styles.bulletPoint}>• To track your fitness progress and calculate improvement metrics</Text>
              <Text style={styles.bulletPoint}>• To manage your subscription and process payments</Text>
              <Text style={styles.bulletPoint}>• To provide personalized workout recommendations</Text>
              <Text style={styles.bulletPoint}>• To send important notifications about your subscription and achievements</Text>
              <Text style={styles.bulletPoint}>• To improve our AI models and app functionality</Text>
              <Text style={styles.bulletPoint}>• To ensure app security and prevent fraud</Text>
              <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Data Security</Text>
              <Text style={styles.sectionText}>
                We implement industry-standard security measures to protect your information:
              </Text>
              <Text style={styles.bulletPoint}>• All data is encrypted in transit using SSL/TLS protocols</Text>
              <Text style={styles.bulletPoint}>• Images are stored securely in Supabase Storage with access controls</Text>
              <Text style={styles.bulletPoint}>• Authentication is handled via OAuth 2.0 with JWT tokens</Text>
              <Text style={styles.bulletPoint}>• Database access is protected with Row Level Security (RLS) policies</Text>
              <Text style={styles.bulletPoint}>• Payment information is processed by PCI-DSS compliant Razorpay</Text>
              <Text style={styles.sectionText}>
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
              <Text style={styles.sectionText}>
                We use the following third-party services to provide our functionality:
              </Text>
              <Text style={styles.bulletPoint}>• Supabase: Database, authentication, and cloud storage (https://supabase.com/privacy)</Text>
              <Text style={styles.bulletPoint}>• Fireworks AI: AI vision models for muscle analysis (https://fireworks.ai/privacy)</Text>
              <Text style={styles.bulletPoint}>• Razorpay: Payment processing and subscription management (https://razorpay.com/privacy)</Text>
              <Text style={styles.bulletPoint}>• Google OAuth: Authentication services (https://policies.google.com/privacy)</Text>
              <Text style={styles.bulletPoint}>• ExerciseDB API: Exercise recommendations (https://rapidapi.com/privacy)</Text>
              <Text style={styles.sectionText}>
                These services have their own privacy policies. We encourage you to review them.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Image Processing and AI Analysis</Text>
              <Text style={styles.sectionText}>
                When you upload photos for analysis:
              </Text>
              <Text style={styles.bulletPoint}>• Images are compressed and processed locally on your device before upload</Text>
              <Text style={styles.bulletPoint}>• Images are sent to Fireworks AI for muscle analysis</Text>
              <Text style={styles.bulletPoint}>• Analysis results are stored in our database linked to your account</Text>
              <Text style={styles.bulletPoint}>• Original images are stored in Supabase Storage for your progress tracking</Text>
              <Text style={styles.bulletPoint}>• You can delete your images and analysis data at any time from the app</Text>
              <Text style={styles.sectionText}>
                We do not use your images for any purpose other than providing the analysis service to you. We do not share or sell your images to third parties.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Data Retention</Text>
              <Text style={styles.sectionText}>
                We retain your information as follows:
              </Text>
              <Text style={styles.bulletPoint}>• Account data: Until you delete your account</Text>
              <Text style={styles.bulletPoint}>• Analysis history: Until you manually delete individual analyses</Text>
              <Text style={styles.bulletPoint}>• Payment records: For 7 years as required by financial regulations</Text>
              <Text style={styles.bulletPoint}>• Cached data: Automatically cleared based on cache policies</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Your Rights</Text>
              <Text style={styles.sectionText}>
                You have the following rights regarding your personal data:
              </Text>
              <Text style={styles.bulletPoint}>• Access: Request a copy of your personal data</Text>
              <Text style={styles.bulletPoint}>• Rectification: Correct inaccurate data through the app settings</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
              <Text style={styles.sectionText}>
                Muscle AI is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
              <Text style={styles.sectionText}>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Cookies and Local Storage</Text>
              <Text style={styles.sectionText}>
                Our app uses local storage and caching to improve performance:
              </Text>
              <Text style={styles.bulletPoint}>• AsyncStorage: For offline access to streak data and preferences</Text>
              <Text style={styles.bulletPoint}>• Analysis Cache: To reduce API calls and improve speed</Text>
              <Text style={styles.bulletPoint}>• Session Storage: To maintain your login state</Text>
              <Text style={styles.sectionText}>
                You can clear this data by logging out or uninstalling the app.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Contact Information</Text>
              <Text style={styles.sectionText}>
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </Text>
              <Text style={styles.contactInfo}>Email: privacy@muscleai.com</Text>
              <Text style={styles.contactInfo}>Support: support@muscleai.com</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Changes to This Policy</Text>
              <Text style={styles.sectionText}>
                We may update our Privacy Policy from time to time. We will notify you of any material changes by:
              </Text>
              <Text style={styles.bulletPoint}>• Updating the "Last updated" date at the top of this policy</Text>
              <Text style={styles.bulletPoint}>• Sending you an in-app notification</Text>
              <Text style={styles.bulletPoint}>• Sending you an email notification (for significant changes)</Text>
              <Text style={styles.sectionText}>
                Your continued use of the app after changes constitutes acceptance of the updated policy.
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
