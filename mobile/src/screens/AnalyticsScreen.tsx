import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  BarChart3,
  Calendar,
  Store,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const AnalyticsScreen: React.FC = () => {
  const { formatCurrency, kpis } = useAuth();
  const [selectedRange, setSelectedRange] = useState<'today' | '7d' | '30d' | '1y'>('7d');

  const ranges: { id: 'today' | '7d' | '30d' | '1y'; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '1y', label: 'This Year' },
  ];

  // Bar chart data for weekly revenue trend
  const weeklyData = [
    { day: 'Mon', val: 180, label: '1.8L' },
    { day: 'Tue', val: 210, label: '2.1L' },
    { day: 'Wed', val: 195, label: '1.9L' },
    { day: 'Thu', val: 240, label: '2.4L' },
    { day: 'Fri', val: 320, label: '3.2L' },
    { day: 'Sat', val: 410, label: '4.1L' },
    { day: 'Sun', val: 380, label: '3.8L' },
  ];
  const maxVal = 450;
  const chartHeight = 120;

  const categories = [
    { name: 'Electronics', revenue: 540000, margin: 31.4, share: 38 },
    { name: 'Apparel & Fashion', revenue: 420000, margin: 48.2, share: 29 },
    { name: 'Home & Kitchen', revenue: 260000, margin: 36.5, share: 18 },
    { name: 'FMCG & Groceries', revenue: 208500, margin: 24.1, share: 15 },
  ];

  const stores = [
    { name: 'Connaught Place', city: 'New Delhi', revenue: 520000, margin: 42.1, psf: '₹2,450' },
    { name: 'Bandra West', city: 'Mumbai', revenue: 410000, margin: 36.8, psf: '₹2,180' },
    { name: 'Indiranagar', city: 'Bengaluru', revenue: 340000, margin: 39.5, psf: '₹1,940' },
    { name: 'Cyber Hub', city: 'Gurugram', revenue: 158500, margin: 35.2, psf: '₹1,750' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Date Filter Tabs */}
      <View style={styles.rangeRow}>
        {ranges.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.rangeTab, selectedRange === r.id && styles.rangeTabActive]}
            onPress={() => setSelectedRange(r.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.rangeTabText, selectedRange === r.id && styles.rangeTabTextActive]}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue Trend Visual Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <TrendingUp color={colors.primary} size={16} />
            <Text style={styles.cardTitle}>WEEKLY REVENUE VELOCITY</Text>
          </View>
          <Text style={styles.totalBadge}>{formatCurrency(kpis.total_revenue)}</Text>
        </View>

        {/* SVG Bar Chart */}
        <View style={styles.chartContainer}>
          <Svg width="100%" height={chartHeight + 30} viewBox="0 0 320 150">
            {/* Guide line */}
            <Line x1="0" y1="120" x2="320" y2="120" stroke="#1e293b" strokeWidth="1" />
            <Line x1="0" y1="60" x2="320" y2="60" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />

            {weeklyData.map((d, index) => {
              const barW = 28;
              const x = 16 + index * 44;
              const barH = (d.val / maxVal) * chartHeight;
              const y = 120 - barH;
              const isPeak = d.val === 410;

              return (
                <React.Fragment key={d.day}>
                  {/* Bar */}
                  <Rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx="4"
                    fill={isPeak ? '#06b6d4' : '#1e293b'}
                    stroke={isPeak ? '#38bdf8' : 'transparent'}
                    strokeWidth={isPeak ? '1' : '0'}
                  />
                  {/* Day Label */}
                  <SvgText
                    x={x + barW / 2}
                    y="138"
                    fontSize="10"
                    fill={isPeak ? '#06b6d4' : '#64748b'}
                    fontWeight={isPeak ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {d.day}
                  </SvgText>
                  {/* Amount Value */}
                  <SvgText
                    x={x + barW / 2}
                    y={Math.max(y - 4, 12)}
                    fontSize="9"
                    fill={isPeak ? '#f8fafc' : '#94a3b8'}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {d.label}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </View>

      {/* Category Performance Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Layers color={colors.secondary} size={16} />
            <Text style={styles.cardTitle}>CATEGORY MARGIN CONTRIBUTIONS</Text>
          </View>
        </View>

        <View style={styles.categoriesList}>
          {categories.map((cat) => (
            <View key={cat.name} style={styles.catItem}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={styles.catMetrics}>
                  <Text style={styles.catRevenue}>{formatCurrency(cat.revenue)}</Text>
                  <View
                    style={[
                      styles.marginTag,
                      {
                        backgroundColor:
                          cat.margin >= 40
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(6, 182, 212, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.marginTagText,
                        { color: cat.margin >= 40 ? colors.success : colors.primary },
                      ]}
                    >
                      {cat.margin}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Track */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${cat.share}%`,
                      backgroundColor: cat.margin >= 40 ? colors.success : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Store Ranking & PSF */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Store color={colors.accent} size={16} />
            <Text style={styles.cardTitle}>STORE EFFICIENCY RANKINGS</Text>
          </View>
        </View>

        <View style={styles.storeList}>
          {stores.map((s, index) => (
            <View key={s.name} style={styles.storeItem}>
              <View style={styles.storeRankBadge}>
                <Text style={styles.storeRankText}>#{index + 1}</Text>
              </View>

              <View style={styles.storeInfo}>
                <Text style={styles.storeMainName}>{s.name}</Text>
                <Text style={styles.storeSubCity}>{s.city}</Text>
              </View>

              <View style={styles.storeStatsRight}>
                <Text style={styles.storeRevenue}>{formatCurrency(s.revenue)}</Text>
                <Text style={styles.storePsf}>{s.psf} PSF</Text>
              </View>
            </View>
          ))}
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
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 3,
    marginBottom: 16,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  rangeTabActive: {
    backgroundColor: colors.primary,
  },
  rangeTabText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  rangeTabTextActive: {
    color: '#02040a',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  totalBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  categoriesList: {
    gap: 12,
  },
  catItem: {
    gap: 6,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  catMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catRevenue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  marginTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  marginTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  storeList: {
    gap: 10,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
  },
  storeRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  storeRankText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  storeInfo: {
    flex: 1,
  },
  storeMainName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  storeSubCity: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  storeStatsRight: {
    alignItems: 'flex-end',
  },
  storeRevenue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  storePsf: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
