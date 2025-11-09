// Subscription Plans Screen - Display and select subscription plans

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { SubscriptionPlan, SubscriptionDetails } from '../types/subscription';
import { fetchSubscriptionPlans, getUserSubscriptionDetails } from '../services/subscriptionService';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

const { width } = Dimensions.get('window');

interface SubscriptionPlansScreenProps {
  navigation: any;
}

export const SubscriptionPlansScreen: React.FC<SubscriptionPlansScreenProps> = ({ navigation }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCurrentPlanDialog, setShowCurrentPlanDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [planToChange, setPlanToChange] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        fetchSubscriptionPlans(),
        getUserSubscriptionDetails(),
      ]);
      
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
      
      // Pre-select current plan if exists (for pending/active subscriptions)
      if (subscriptionData) {
        const currentPlan = plansData.find(p => p.plan_name === subscriptionData.plan_name);
        if (currentPlan) {
          setSelectedPlan(currentPlan.id);
        }
      }
    } catch (error) {
      console.error('❌ Error loading plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (currentSubscription && currentSubscription.subscription_status === 'active') {
      if (currentSubscription.plan_name === plan.plan_name) {
        setShowCurrentPlanDialog(true);
        return;
      }
      
      // User wants to change plan
      setPlanToChange(plan);
      setShowChangePlanDialog(true);
      return;
    }
    
    setSelectedPlan(plan.id);
    navigation.navigate('Payment', { plan });
  };

  const handleChangePlanConfirm = () => {
    if (planToChange) {
      setSelectedPlan(planToChange.id);
      navigation.navigate('Payment', { plan: planToChange, isUpgrade: true });
      setShowChangePlanDialog(false);
      setPlanToChange(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return 'medal-outline';
      case 'pro':
        return 'star-circle';
      case 'vip':
        return 'crown';
      default:
        return 'diamond-stone';
    }
  };

  const getPlanColor = (planName: string): [string, string, string] => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return ['#667eea', '#764ba2', '#f093fb'];
      case 'pro':
        return ['#fa709a', '#fee140', '#30cfd0'];
      case 'vip':
        return ['#ffd89b', '#19547b', '#ffd89b'];
      default:
        return [COLORS.primary, COLORS.primaryDark, COLORS.primary];
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentSubscription?.plan_name === plan.plan_name;
    const colors = getPlanColor(plan.plan_name);
    const isPremium = plan.plan_name.toLowerCase() === 'vip' || plan.plan_name.toLowerCase() === 'pro';
    
    return (
      <TouchableOpacity
        key={plan.id}
        onPress={() => handleSelectPlan(plan)}
        activeOpacity={0.85}
        style={[styles.planCardWrapper, isPremium && styles.premiumCardWrapper]}
      >
        <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
          {/* Top Badge */}
          {isCurrentPlan && (
            <View style={styles.currentBadge}>
              <Icon name="check-decagram" size={14} color="#FFF" />
              <Text style={styles.currentBadgeText}>ACTIVE</Text>
            </View>
          )}
          
          {isPremium && !isCurrentPlan && (
            <View style={styles.popularBadge}>
              <Icon name="star" size={14} color="#FFF" />
              <Text style={styles.popularBadgeText}>POPULAR</Text>
            </View>
          )}
          
          {/* Card Header with Gradient Background */}
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            <View style={styles.planIconContainer}>
              <Icon name={getPlanIcon(plan.plan_name)} size={44} color="#FFF" />
            </View>
            
            <Text style={styles.planName}>{plan.plan_name.toUpperCase()}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <Text style={styles.planPrice}>{plan.plan_price_usd}</Text>
              <Text style={styles.planPriceUnit}>/mo</Text>
            </View>
          </LinearGradient>
          
          {/* Card Body */}
          <View style={styles.cardBody}>
            <Text style={styles.planDescription}>{plan.description}</Text>
            
            {/* Analysis Limit Badge */}
            <View style={styles.analysisLimitContainer}>
              <Icon name="chart-line" size={18} color={colors[0]} />
              <Text style={[styles.analysisLimitText, { color: colors[0] }]}>
                {plan.monthly_analyses_limit} AI analyses per month
              </Text>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Features List */}
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.checkCircle, { backgroundColor: colors[0] + '20' }]}>
                    <Icon name="check" size={12} color={colors[0]} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Action Button */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={[
                styles.selectButton,
                isCurrentPlan && styles.currentButton,
                { borderColor: colors[0] }
              ]}
              onPress={() => handleSelectPlan(plan)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={isCurrentPlan ? ['#95a5a6', '#7f8c8d'] : [colors[0], colors[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.selectButtonText}>
                  {isCurrentPlan ? 'Your Current Plan' : 'Get Started'}
                </Text>
                {!isCurrentPlan && <Icon name="arrow-right" size={20} color="#FFF" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentSubscription?.subscription_status === 'active' ? 'Change Your Plan' : 'Choose Your Plan'}
        </Text>
        <View style={styles.backButton} />
      </View>

      {currentSubscription && currentSubscription.subscription_status === 'active' && (
        <View style={styles.currentStatusContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.currentStatus}
          >
            <View style={styles.statusContent}>
              <View style={styles.statusLeft}>
                <Icon name="check-circle" size={24} color="#FFF" />
                <View style={styles.statusTextContainer}>
                  <Text style={styles.currentStatusTitle}>Active Subscription</Text>
                  <Text style={styles.currentStatusPlan}>{currentSubscription.plan_name} Plan</Text>
                </View>
              </View>
              <View style={styles.statusRight}>
                <Text style={styles.remainingCount}>{currentSubscription.analyses_remaining}</Text>
                <Text style={styles.remainingLabel}>left</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            {currentSubscription?.subscription_status === 'active' 
              ? 'Upgrade or downgrade your subscription' 
              : 'Unlock AI-powered fitness insights'}
          </Text>
        </View>
        
        {plans.map((plan) => renderPlanCard(plan))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • All plans include AI-powered body analysis
          </Text>
          <Text style={styles.footerText}>
            • Cancel anytime, no long-term commitment
          </Text>
          <Text style={styles.footerText}>
            • Secure payment via Razorpay
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={showCurrentPlanDialog}
        title="Current Plan"
        message="You are already subscribed to this plan."
        confirmText="OK"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setShowCurrentPlanDialog(false)}
        onCancel={() => setShowCurrentPlanDialog(false)}
        icon={<Icon name="check-circle" size={48} color={COLORS.success} />}
      />

      <ConfirmationDialog
        visible={showChangePlanDialog}
        title="Change Plan"
        message={planToChange ? `Switch from ${currentSubscription?.plan_name} to ${planToChange.plan_name}?` : ''}
        confirmText="Continue"
        cancelText="Cancel"
        confirmButtonStyle="primary"
        onConfirm={handleChangePlanConfirm}
        onCancel={() => {
          setShowChangePlanDialog(false);
          setPlanToChange(null);
        }}
        icon={<Icon name="swap-horizontal" size={48} color={COLORS.primary} />}
      />
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
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  currentStatusContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  currentStatus: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusTextContainer: {
    marginLeft: 12,
  },
  currentStatusTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    fontWeight: '500',
  },
  currentStatusPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusRight: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  remainingCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  remainingLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  planCardWrapper: {
    marginBottom: 20,
  },
  premiumCardWrapper: {
    transform: [{ scale: 1.02 }],
  },
  planCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    zIndex: 10,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    zIndex: 10,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardHeader: {
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  planIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  planPrice: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: 56,
  },
  planPriceUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    marginLeft: 4,
  },
  cardBody: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  planDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  analysisLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  analysisLimitText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  featuresContainer: {
    marginTop: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  cardFooter: {
    padding: 20,
  },
  selectButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentButton: {
    elevation: 2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  footer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
