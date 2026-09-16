import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  TrendingUp,
  Percent,
  ShoppingBag,
  ArrowUpRight,
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { LivePosTicker } from '../components/LivePosTicker';

interface HomeScreenProps {
  onNavigateTab: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab }) => {
  const {
    kpis,
    formatCurrency,
    marginRisks,
    stockoutAlerts,
    simulateNewSale,
    activePlan,
    plans,
    openPaymentModal,
  } = useAuth();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    simulateNewSale();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, [simulateNewSale]);

  const topRisk = marginRisks[0];
  const proPlan = plans.find((p) => p.id === 'pro') || plans[1];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Executive Headline Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>TODAY'S GROSS REVENUE</Text>
          <View style={styles.growthBadge}>
            <TrendingUp color={colors.success} size={12} />
            <Text style={styles.growthText}>+{kpis.yoy_growth_pct}% YoY</Text>
          </View>
        </View>

        <Text style={styles.heroAmount}>{formatCurrency(kpis.total_revenue)}</Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroSubStat}>
            <Text style={styles.heroSubLabel}>Gross Margin</Text>
            <Text style={styles.heroSubVal}>{kpis.gross_margin_pct}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroSubStat}>
            <Text style={styles.heroSubLabel}>Total Orders</Text>
            <Text style={styles.heroSubVal}>{kpis.total_orders.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroSubStat}>
            <Text style={styles.heroSubLabel}>Avg Basket</Text>
            <Text style={styles.heroSubVal}>{formatCurrency(kpis.avg_basket_size)}</Text>
          </View>
        </View>
      </View>

      {/* Live POS Streamer Ticker */}
      <LivePosTicker />

      {/* Critical Margin Radar Alert Banner */}
      {topRisk && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => onNavigateTab('insights')}
          activeOpacity={0.8}
        >
          <View style={styles.alertIconBadge}>
            <AlertTriangle color={colors.danger} size={18} />
          </View>
          <View style={styles.alertContent}>
            <View style={styles.alertHeaderRow}>
              <Text style={styles.alertTitle}>Margin Leakage Detected</Text>
              <Text style={styles.alertNegative}>{topRisk.margin_pct}%</Text>
            </View>
            <Text style={styles.alertSub} numberOfLines={1}>
              {topRisk.name} is selling below cost in {topRisk.store}
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={16} />
        </TouchableOpacity>
      )}

      {/* Quick Action Grid */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionHeading}>RAPID ACTIONS</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={simulateNewSale}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}>
              <Zap color={colors.primary} size={18} />
            </View>
            <Text style={styles.actionTitle}>+1 Live Sale</Text>
            <Text style={styles.actionSub}>Simulate POS hit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigateTab('insights')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <AlertTriangle color={colors.danger} size={18} />
            </View>
            <Text style={styles.actionTitle}>Margin Radar</Text>
            <Text style={styles.actionSub}>{marginRisks.length} active alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigateTab('analytics')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
              <TrendingUp color={colors.secondary} size={18} />
            </View>
            <Text style={styles.actionTitle}>Trends</Text>
            <Text style={styles.actionSub}>Sales breakdown</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => openPaymentModal(proPlan)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <CreditCard color={colors.success} size={18} />
            </View>
            <Text style={styles.actionTitle}>Upgrade Plan</Text>
            <Text style={styles.actionSub}>Instant UPI QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active SaaS Plan Status Card */}
      <View style={styles.saasCard}>
        <View style={styles.saasHeader}>
          <View style={styles.saasLeft}>
            <ShieldCheck color={colors.primary} size={18} />
            <Text style={styles.saasTitle}>SaaS Workspace Active</Text>
          </View>
          <View style={styles.saasBadge}>
            <Text style={styles.saasBadgeText}>{activePlan.name}</Text>
          </View>
        </View>
        <Text style={styles.saasBody}>
          {activePlan.limits.stores} Store limit • {activePlan.limits.monthly_orders.toLocaleString()} Monthly Orders • {activePlan.limits.team_members} Team Seats
        </Text>
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
  heroCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    padding: 20,
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  growthText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  heroAmount: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroSubStat: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroSubLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroSubVal: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
    gap: 12,
  },
  alertIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  alertNegative: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  alertSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  actionsSection: {
    marginVertical: 12,
  },
  sectionHeading: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
  },
  actionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  saasCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  saasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  saasLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saasTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  saasBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  saasBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  saasBody: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
