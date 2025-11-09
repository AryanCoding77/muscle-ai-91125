import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { DeletionRequestDialog } from '../components/ui/DeletionRequestDialog';
import { submitAccountDeletionRequest } from '../services/accountDeletionService';


export const SettingsScreen = ({ navigation }: any) => {
  const { user, profile: authProfile, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  
  const haptic = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  // Get user display information
  const displayName = authProfile?.username || authProfile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const handleLogout = async () => {
    haptic();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut();
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutDialog(false);
      setTimeout(() => Alert.alert('Error', 'Failed to logout. Please try again.'), 100);
    }
  };

  const handleDeleteRequest = () => {
    haptic();
    setShowDeletionDialog(true);
  };

  const handleDeleteConfirm = async (reason: string) => {
    try {
      const result = await submitAccountDeletionRequest({ reason });
      
      setShowDeletionDialog(false);
      
      if (result.success) {
        setTimeout(() => {
          Alert.alert(
            'Request Submitted',
            result.message,
            [{ text: 'OK', onPress: () => haptic() }]
          );
        }, 300);
      } else {
        setTimeout(() => {
          Alert.alert(
            'Request Failed',
            result.message,
            [{ text: 'OK', onPress: () => haptic() }]
          );
        }, 300);
      }
    } catch (error) {
      console.error('Deletion request error:', error);
      setShowDeletionDialog(false);
      setTimeout(() => {
        Alert.alert(
          'Error',
          'Failed to submit deletion request. Please try again.',
          [{ text: 'OK', onPress: () => haptic() }]
        );
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerBar}> 
          <TouchableOpacity onPress={() => { haptic(); navigation.goBack(); }} style={styles.headerIconBtn}>
            <Icon name="chevron-left" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Profile</Text>
          <View style={styles.headerIconSpacer} />
        </View>

        {/* Profile summary card */}
        <View style={styles.profileCard}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Image source={require('../../assets/icon.png')} style={styles.avatar} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
        </View>

        {/* Support section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <Row icon="card-account-phone-outline" label="Contact" onPress={haptic} />
          <View style={styles.rowDivider} />
          <Row icon="delete-forever" label="Request Account Deletion" onPress={handleDeleteRequest} iconColor="#FF453A" labelColor="#FFFFFF" />
        </View>
      </ScrollView>
      
      {/* Logout Button - Fixed at bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="logout" size={20} color="#FF453A" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonStyle="destructive"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
        icon={<Icon name="logout" size={48} color={COLORS.danger} />}
      />
      
      {/* Deletion Request Dialog */}
      <DeletionRequestDialog
        visible={showDeletionDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletionDialog(false)}
      />
    </SafeAreaView>
  );
};

function Row({ icon, label, onPress, iconColor, labelColor }: { icon: string; label: string; onPress?: () => void; iconColor?: string; labelColor?: string }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Icon name={icon as any} size={24} color={iconColor || COLORS.text} />
        </View>
        <Text style={[styles.rowLabel, labelColor && { color: labelColor }]}>{label}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 16,
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 20,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerIconSpacer: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
