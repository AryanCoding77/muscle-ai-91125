// Payment Screen - Handle Razorpay payment integration

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';
import { SubscriptionPlan } from '../types/subscription';
import { createSubscription, changeSubscriptionPlan, getUserSubscriptionDetails } from '../services/subscriptionService';
import { supabase } from '../lib/supabase';

interface PaymentScreenProps {
  navigation: any;
  route: {
    params: {
      plan: SubscriptionPlan;
      isUpgrade?: boolean;
    };
  };
}

// Get Razorpay key from environment
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { plan, isUpgrade = false } = route.params;
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState('');

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }

      // Check if user has an active subscription
      const subscription = await getUserSubscriptionDetails();
      if (subscription && subscription.subscription_status === 'active') {
        setHasActiveSubscription(true);
        setCurrentPlanName(subscription.plan_name);
      }
    } catch (error) {
      console.error('❌ Error loading user details:', error);
    }
  };

  const handlePayment = async () => {
    if (!RAZORPAY_KEY) {
      Alert.alert('Configuration Error', 'Razorpay key is not configured. Please add EXPO_PUBLIC_RAZORPAY_KEY_ID to your .env file.');
      return;
    }

    try {
      setLoading(true);

      let subscriptionResult;

      // Use different function based on whether this is a plan change or new subscription
      if (hasActiveSubscription || isUpgrade) {
        console.log('🔄 Initiating plan change...');
        subscriptionResult = await changeSubscriptionPlan(plan.id);
      } else {
        console.log('🆕 Creating new subscription...');
        subscriptionResult = await createSubscription(plan.id);
      }

      if (!subscriptionResult.success || !subscriptionResult.short_url) {
        throw new Error(subscriptionResult.error || 'Failed to process subscription');
      }

      setLoading(false);

      // Open payment link in browser
      const supported = await Linking.canOpenURL(subscriptionResult.short_url);
      if (supported) {
        await Linking.openURL(subscriptionResult.short_url);
        
        // Navigate to Home page and reset navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
        });
        
        // Show info to user after navigation
        setTimeout(() => {
          const message = hasActiveSubscription || isUpgrade
            ? 'Complete your payment in the browser. Your new plan will activate automatically within a minute after payment.'
            : 'Complete your payment in the browser. Your subscription will activate automatically within a minute after payment.';
          
          Alert.alert(
            'Payment Link Opened',
            message,
            [{ text: 'OK' }]
          );
        }, 500);
      } else {
        throw new Error('Cannot open payment link');
      }

    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      setLoading(false);
      setProcessingPayment(false);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.'
      );
    }
  };

  const renderPlanSummary = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>
        {hasActiveSubscription || isUpgrade ? 'Plan Change Summary' : 'Plan Summary'}
      </Text>
      
      {(hasActiveSubscription || isUpgrade) && currentPlanName && (
        <>
          <View style={styles.currentPlanRow}>
            <Text style={styles.summaryLabel}>Current Plan:</Text>
            <Text style={styles.currentPlanText}>{currentPlanName}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>↓</Text>
          </View>
        </>
      )}
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>New Plan:</Text>
        <Text style={styles.summaryValue}>{plan.plan_name}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Monthly Analyses:</Text>
        <Text style={styles.summaryValue}>{plan.monthly_analyses_limit}</Text>
      </View>
      
      <View style={styles.summaryDivider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Amount:</Text>
        <Text style={styles.summaryPrice}>${plan.plan_price_usd}/month</Text>
      </View>
      
      {(hasActiveSubscription || isUpgrade) && (
        <View style={styles.changeNotice}>
          <Text style={styles.changeNoticeText}>
            💡 Your current plan will be cancelled and the new plan will start immediately after payment.
          </Text>
        </View>
      )}
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.featuresCard}>
      <Text style={styles.featuresTitle}>What's Included</Text>
      {plan.features.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Text style={styles.featureCheck}>✓</Text>
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {hasActiveSubscription || isUpgrade ? 'Change Plan' : 'Complete Payment'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#1a1a1a', '#0a0a0a']}
          style={styles.content}
        >
          {renderPlanSummary()}
          {renderFeatures()}

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Secure payment powered by Razorpay. Your payment information is encrypted and secure.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, (loading || processingPayment) && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading || processingPayment}
          >
            {loading || processingPayment ? (
              <View style={styles.payButtonContent}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.payButtonText}>
                  {loading ? 'Preparing...' : 'Processing Payment...'}
                </Text>
              </View>
            ) : (
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payButtonGradient}
              >
                <Text style={styles.payButtonText}>Pay ${plan.plan_price_usd}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Your subscription will auto-renew monthly unless cancelled.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 15,
  },
  summaryPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureCheck: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 10,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: COLORS.primary,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  currentPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  arrowText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  changeNotice: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  changeNoticeText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    textAlign: 'center',
  },
});
