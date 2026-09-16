import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, Radio, Sparkles, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { tenant, activePlan, liveStreaming, toggleLiveStreaming, currency, setCurrency } = useAuth();

  const handleNextCurrency = () => {
    if (currency === 'INR') setCurrency('USD');
    else if (currency === 'USD') setCurrency('EUR');
    else setCurrency('INR');
  };

  const getTierColor = () => {
    if (tenant.tier === 'business') return colors.secondary;
    if (tenant.tier === 'pro') return colors.primary;
    return colors.textMuted;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Activity color={colors.primary} size={20} />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>RetailPulse</Text>
              <View style={[styles.tierTag, { borderColor: getTierColor() }]}>
                <ShieldCheck color={getTierColor()} size={11} />
                <Text style={[styles.tierText, { color: getTierColor() }]}>
                  {activePlan.name.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.tenantName} numberOfLines={1}>
              {tenant.name}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* Currency Switcher */}
          <TouchableOpacity
            style={styles.currencyButton}
            onPress={handleNextCurrency}
            activeOpacity={0.7}
          >
            <Text style={styles.currencyText}>
              {currency === 'INR' ? '₹ INR' : currency === 'USD' ? '$ USD' : '€ EUR'}
            </Text>
          </TouchableOpacity>

          {/* Live Stream Beacon */}
          <TouchableOpacity
            style={[
              styles.liveBadge,
              liveStreaming ? styles.liveBadgeActive : styles.liveBadgePaused,
            ]}
            onPress={toggleLiveStreaming}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.liveDot,
                { backgroundColor: liveStreaming ? colors.success : colors.textMuted },
              ]}
            />
            <Radio
              color={liveStreaming ? colors.success : colors.textMuted}
              size={12}
            />
            <Text
              style={[
                styles.liveText,
                { color: liveStreaming ? colors.success : colors.textMuted },
              ]}
            >
              {liveStreaming ? 'STREAM' : 'PAUSED'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tierTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tenantName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyButton: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  currencyText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  liveBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  liveBadgePaused: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
