import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    targetUpgradePlan,
    upgradePlanWithUtr,
    formatCurrency,
  } = useAuth();

  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!isPaymentModalOpen) {
      setUtr('');
      setError(null);
      setSuccess(false);
      setTimeLeft(600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaymentModalOpen]);

  if (!targetUpgradePlan) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const upiId = 'harshdeepchak97-1@oksbi';
  const payeeName = 'Harsh deep Chak';
  const price = targetUpgradePlan.price_monthly;

  const handleCopyUpi = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!utr.trim() || utr.trim().length < 8) {
      setError('Please enter a valid 8-16 digit bank UTR / Reference code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await upgradePlanWithUtr(targetUpgradePlan.id, utr.trim());
      setSuccess(true);
      setTimeout(() => {
        closePaymentModal();
      }, 2200);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed. Check reference code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isPaymentModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closePaymentModal}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.headerRow}>
            <View style={styles.headerBadge}>
              <Sparkles color={colors.primary} size={16} />
              <Text style={styles.headerTitle}>SaaS UPI Instant Gateway</Text>
            </View>
            <TouchableOpacity
              onPress={closePaymentModal}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {success ? (
              <View style={styles.successView}>
                <View style={styles.successIconBadge}>
                  <CheckCircle2 color={colors.success} size={48} />
                </View>
                <Text style={styles.successTitle}>Subscription Activated!</Text>
                <Text style={styles.successSub}>
                  Your workspace has been upgraded to {targetUpgradePlan.name}. All team
                  members now enjoy full unlocked access!
                </Text>
              </View>
            ) : (
              <>
                {/* Plan banner */}
                <View style={styles.planBanner}>
                  <View>
                    <Text style={styles.planName}>{targetUpgradePlan.name}</Text>
                    <Text style={styles.planSub}>{targetUpgradePlan.tagline}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>{formatCurrency(price)}</Text>
                    <Text style={styles.pricePeriod}>/month</Text>
                  </View>
                </View>

                {/* Countdown Timer */}
                <View style={styles.timerRow}>
                  <Clock color={colors.warning} size={14} />
                  <Text style={styles.timerText}>
                    Session valid for: <Text style={styles.timerHighlight}>{timeFormatted}</Text>
                  </Text>
                </View>

                {/* QR Code Graphic Container */}
                <View style={styles.qrContainer}>
                  <View style={styles.qrFrame}>
                    <Image
                      source={require('../../assets/payment-qr.jpg')}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.qrHelperText}>Scan via GPay / PhonePe / Paytm / BHIM</Text>
                </View>

                {/* Verified Merchant Details */}
                <View style={styles.merchantBox}>
                  <ShieldCheck color={colors.success} size={14} />
                  <Text style={styles.merchantLabel}>
                    Verified Payee: <Text style={styles.merchantName}>{payeeName}</Text>
                  </Text>
                </View>

                {/* Copyable UPI Box */}
                <View style={styles.upiBox}>
                  <View>
                    <Text style={styles.upiLabel}>Official UPI ID</Text>
                    <Text style={styles.upiIdText}>{upiId}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={handleCopyUpi}
                    activeOpacity={0.7}
                  >
                    <Copy color={copied ? colors.success : colors.primary} size={14} />
                    <Text style={[styles.copyBtnText, copied && { color: colors.success }]}>
                      {copied ? 'COPIED' : 'COPY'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Step 2: UTR Reference Code Input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Step 2: Enter 12-Digit Bank UTR / Ref No.</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 429381029482"
                    placeholderTextColor={colors.textMuted}
                    value={utr}
                    onChangeText={(text) => {
                      setUtr(text);
                      if (error) setError(null);
                    }}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                  <Text style={styles.inputHint}>
                    Found in your bank receipt or SMS after successful transfer
                  </Text>
                </View>

                {error && (
                  <View style={styles.errorBox}>
                    <AlertCircle color={colors.danger} size={14} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                  onPress={handleVerify}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#02040a" size="small" />
                  ) : (
                    <>
                      <Lock color="#02040a" size={16} />
                      <Text style={styles.verifyButtonText}>Verify & Activate Instant Access</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.footerGuarantees}>
                  <ShieldCheck color={colors.textMuted} size={13} />
                  <Text style={styles.guaranteeText}>
                    Zero commissions • Direct UPI Settlement • Instant Activation
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.surfaceElevated,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 18,
  },
  planBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  planName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  planSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  pricePeriod: {
    color: colors.textMuted,
    fontSize: 10,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  timerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  timerHighlight: {
    color: colors.warning,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  qrFrame: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 190,
    height: 190,
    borderRadius: 10,
  },
  merchantBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  merchantLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  merchantName: {
    color: colors.success,
    fontWeight: '800',
  },
  qrHelperText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  upiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  upiLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  upiIdText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  inputSection: {
    marginVertical: 8,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputHint: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    flex: 1,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#02040a',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerGuarantees: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  guaranteeText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  successView: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  successSub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
