import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Zap, ShoppingBag, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { PosTransaction } from '../types';

export const LivePosTicker: React.FC = () => {
  const { posTransactions, formatCurrency, simulateNewSale } = useAuth();

  const getMarginColor = (margin: number) => {
    if (margin < 0) return colors.danger;
    if (margin < 20) return colors.warning;
    return colors.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.headerLeft}>
          <Zap color={colors.primary} size={15} />
          <Text style={styles.title}>LIVE POS FEED</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{posTransactions.length} recent</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.simulateBtn}
          onPress={simulateNewSale}
          activeOpacity={0.7}
        >
          <PlusCircle color={colors.primary} size={14} />
          <Text style={styles.simulateBtnText}>Simulate Sale</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {posTransactions.map((tx) => {
          const marginColor = getMarginColor(tx.margin_pct);
          return (
            <View
              key={tx.id}
              style={[
                styles.card,
                tx.is_new ? styles.newCardGlow : null,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.storeRow}>
                  <ShoppingBag color={colors.textMuted} size={11} />
                  <Text style={styles.storeName} numberOfLines={1}>
                    {tx.store_name}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{tx.timestamp}</Text>
              </View>

              <Text style={styles.skuText} numberOfLines={1}>
                {tx.sku}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.amountText}>{formatCurrency(tx.amount)}</Text>
                <View style={[styles.marginBadge, { backgroundColor: `${marginColor}15` }]}>
                  {tx.margin_pct >= 0 ? (
                    <ArrowUpRight color={marginColor} size={11} />
                  ) : (
                    <ArrowDownRight color={marginColor} size={11} />
                  )}
                  <Text style={[styles.marginText, { color: marginColor }]}>
                    {tx.margin_pct > 0 ? `+${tx.margin_pct}%` : `${tx.margin_pct}%`}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentTag}>
                <Text style={styles.paymentMethodText}>{tx.payment_method}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  countText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  simulateBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 10,
    width: 170,
  },
  newCardGlow: {
    borderColor: 'rgba(6, 182, 212, 0.6)',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 4,
  },
  storeName: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 9,
  },
  skuText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  amountText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  marginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  marginText: {
    fontSize: 9,
    fontWeight: '700',
  },
  paymentTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    display: 'none',
  },
  paymentMethodText: {
    color: colors.textMuted,
    fontSize: 8,
  },
});
