import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

interface DeletionRequestDialogProps {
  visible: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const DeletionRequestDialog: React.FC<DeletionRequestDialogProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason(''); // Clear the input after successful submission
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.iconContainer}>
            <Icon name="alert-circle-outline" size={56} color="#FF453A" />
          </View>
          
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Request Account Deletion</Text>
              <Text style={styles.message}>
                We're sorry to see you go. Please tell us why you want to delete your account. This helps us improve our service.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reason for deletion *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Please share your reason..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
                <Text style={styles.charCount}>{reason.length}/500</Text>
              </View>

              <View style={styles.noteContainer}>
                <Icon name="information" size={18} color={COLORS.primary} />
                <Text style={styles.noteText}>
                  After submitting, we'll contact you via email to confirm your request.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!reason.trim() || isSubmitting) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={!reason.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialogContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: screenWidth * 0.9,
    maxWidth: 440,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  scrollContent: {
    maxHeight: 400,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#FF3B3050',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
