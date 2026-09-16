import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  Check,
  Zap,
  Users,
  CreditCard,
  Building,
  QrCode,
  DollarSign,
  Radio,
  Server,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { Plan } from '../types';

export const ProfileScreen: React.FC = () => {
  const {
    tenant,
    plans,
    activePlan,
    openPaymentModal,
    switchPlanDirect,
    formatCurrency,
    teamMembers,
    currency,
    setCurrency,
    liveStreaming,
    toggleLiveStreaming,
  } = useAuth();

  const handlePlanAction = (plan: Plan) => {
    if (plan.id === tenant.tier) {
      Alert.alert('Active Plan', `Your workspace is currently on ${plan.name}.`);
      return;
    }

    if (plan.id === 'free') {
      switchPlanDirect('free');
      Alert.alert('Plan Switched', 'You have switched to the Free Forever plan.');
      return;
    }

    // Pro or Business requires payment modal with UPI QR code
    openPaymentModal(plan);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Workspace Header Card */}
      <View style={styles.workspaceCard}>
        <View style={styles.wsHeader}>
          <View style={styles.wsIcon}>
            <Building color={colors.primary} size={20} />
          </View>
          <View style={styles.wsInfo}>
            <Text style={styles.wsName}>{tenant.name}</Text>
            <Text style={styles.wsSlug}>{tenant.domain || 'retailpulse.cloud'}</Text>
          </View>
          <View style={styles.activeTag}>
            <View style={styles.activeDot} />
            <Text style={styles.activeTagText}>ACTIVE</Text>
          </View>
        </View>

        <View style={styles.subDetails}>
          <View style={styles.subCol}>
            <Text style={styles.subLabel}>Current Tier</Text>
            <Text style={styles.subVal}>{activePlan.name}</Text>
          </View>
          <View style={styles.subCol}>
            <Text style={styles.subLabel}>Payment Ref</Text>
            <Text style={styles.subVal} numberOfLines={1}>
              {tenant.last_payment_ref || 'N/A (Free)'}
            </Text>
          </View>
          <View style={styles.subCol}>
            <Text style={styles.subLabel}>Team Seats</Text>
            <Text style={styles.subVal}>
              {teamMembers.length} / {activePlan.limits.team_members}
            </Text>
          </View>
        </View>
      </View>

      {/* SaaS Pricing Plans Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <CreditCard color={colors.primary} size={15} />
          <Text style={styles.sectionTitle}>SUBSCRIPTION & PRICING PLANS</Text>
        </View>

        {plans.map((plan) => {
          const isCurrent = plan.id === tenant.tier;
          const isPro = plan.id === 'pro';

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                isCurrent && styles.planCardActive,
                isPro && !isCurrent && styles.planCardHighlight,
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Sparkles color="#02040a" size={10} />
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}

              <View style={styles.planCardHeader}>
                <View>
                  <Text style={styles.planNameText}>{plan.name}</Text>
                  <Text style={styles.planTagline}>{plan.tagline}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.planPriceNumber}>
                    {plan.price_monthly === 0 ? '₹0' : formatCurrency(plan.price_monthly)}
                  </Text>
                  <Text style={styles.planPricePeriod}>
                    {plan.price_monthly === 0 ? 'forever' : '/month'}
                  </Text>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                {plan.features.slice(0, 4).map((feat, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Check color={isCurrent ? colors.primary : colors.textSecondary} size={12} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.planActionButton,
                  isCurrent ? styles.currentPlanBtn : styles.upgradePlanBtn,
                ]}
                onPress={() => handlePlanAction(plan)}
                activeOpacity={0.8}
              >
                {isCurrent ? (
                  <>
                    <ShieldCheck color={colors.primary} size={15} />
                    <Text style={styles.currentPlanBtnText}>Current Active Plan</Text>
                  </>
                ) : plan.price_monthly === 0 ? (
                  <Text style={styles.upgradePlanBtnText}>Downgrade to Free</Text>
                ) : (
                  <>
                    <QrCode color="#02040a" size={15} />
                    <Text style={styles.upgradePlanBtnText}>
                      Upgrade via UPI QR • {formatCurrency(plan.price_monthly)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Team Roster */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Users color={colors.secondary} size={15} />
          <Text style={styles.sectionTitle}>
            TEAM MEMBERS ({teamMembers.length}/{activePlan.limits.team_members})
          </Text>
        </View>

        <View style={styles.teamCard}>
          {teamMembers.map((m) => (
            <View key={m.id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarLetter}>{m.name.charAt(0)}</Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberEmail}>{m.email}</Text>
              </View>
              <View style={styles.memberRoleBadge}>
                <Text style={styles.memberRoleText}>{m.role}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.inviteBtn}
            onPress={() =>
              Alert.alert('Invite Member', 'Enter email address to send team invitation link.')
            }
            activeOpacity={0.7}
          >
            <Text style={styles.inviteBtnText}>+ Invite Team Member</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Settings */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Server color={colors.textSecondary} size={15} />
          <Text style={styles.sectionTitle}>PREFERENCES & ARCHITECTURE</Text>
        </View>

        <View style={styles.settingsCard}>
          {/* Currency setting */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Display Currency</Text>
            <View style={styles.currencyChips}>
              {(['INR', 'USD', 'EUR'] as const).map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.chipBtn,
                    currency === curr && styles.chipBtnActive,
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      currency === curr && styles.chipTextActive,
                    ]}
                  >
                    {curr === 'INR' ? '₹ INR' : curr === 'USD' ? '$ USD' : '€ EUR'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* POS Live Feeder */}
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Real-Time POS Feeder</Text>
              <Text style={styles.settingSubLabel}>Stream live sales ticker</Text>
            </View>
            <TouchableOpacity
              style={[styles.streamSwitch, liveStreaming && styles.streamSwitchOn]}
              onPress={toggleLiveStreaming}
            >
              <Text style={styles.streamSwitchText}>{liveStreaming ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* Backend Connection */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.settingLabel}>Backend Architecture</Text>
              <Text style={styles.settingSubLabel}>FastAPI + SQLite Tenant Isolation</Text>
            </View>
            <View style={styles.connStatusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.connStatusText}>CONNECTED</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  workspaceCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 16,
  },
  wsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wsInfo: {
    flex: 1,
  },
  wsName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  wsSlug: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  activeTagText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  subDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  subCol: {
    flex: 1,
  },
  subLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  subVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  planCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
  },
  planCardHighlight: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularBadgeText: {
    color: '#02040a',
    fontSize: 9,
    fontWeight: '800',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planNameText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  planTagline: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    maxWidth: 200,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPriceNumber: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  planPricePeriod: {
    color: colors.textMuted,
    fontSize: 10,
  },
  featuresList: {
    gap: 6,
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  planActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  currentPlanBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  currentPlanBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  upgradePlanBtn: {
    backgroundColor: colors.primary,
  },
  upgradePlanBtnText: {
    color: '#02040a',
    fontSize: 12,
    fontWeight: '800',
  },
  teamCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  memberEmail: {
    color: colors.textMuted,
    fontSize: 10,
  },
  memberRoleBadge: {
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  memberRoleText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  inviteBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inviteBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  settingSubLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  currencyChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.primary,
  },
  streamSwitch: {
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  streamSwitchOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  streamSwitchText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  connStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connStatusText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
});
