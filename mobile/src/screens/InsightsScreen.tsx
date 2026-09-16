import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  AlertTriangle,
  PackageX,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Clock,
  ShieldAlert,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const InsightsScreen: React.FC = () => {
  const { marginRisks, stockoutAlerts, aiInsights, formatCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState<'margin' | 'stockout' | 'ai'>('margin');
  const [fixedItemIds, setFixedItemIds] = useState<string[]>([]);

  const handleFixPrice = (id: string, name: string, suggestedPrice: number) => {
    setFixedItemIds((prev) => [...prev, id]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'margin' && styles.tabBtnActive]}
          onPress={() => setActiveTab('margin')}
          activeOpacity={0.7}
        >
          <AlertTriangle
            color={activeTab === 'margin' ? colors.danger : colors.textSecondary}
            size={14}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'margin' && styles.tabBtnTextActive]}
          >
            Margin Radar ({marginRisks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'stockout' && styles.tabBtnActive]}
          onPress={() => setActiveTab('stockout')}
          activeOpacity={0.7}
        >
          <PackageX
            color={activeTab === 'stockout' ? colors.warning : colors.textSecondary}
            size={14}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'stockout' && styles.tabBtnTextActive]}
          >
            Stockouts ({stockoutAlerts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ai' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ai')}
          activeOpacity={0.7}
        >
          <Sparkles
            color={activeTab === 'ai' ? colors.primary : colors.textSecondary}
            size={14}
          />
          <Text
            style={[styles.tabBtnText, activeTab === 'ai' && styles.tabBtnTextActive]}
          >
            AI Engine
          </Text>
        </TouchableOpacity>
      </View>

      {/* Margin Risk Radar Tab */}
      {activeTab === 'margin' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BELOW-COST SELLING DETECTION</Text>
            <Text style={styles.sectionBadgeText}>{marginRisks.length} critical items</Text>
          </View>

          {marginRisks.map((item) => {
            const isFixed = fixedItemIds.includes(item.id);
            return (
              <View
                key={item.id}
                style={[styles.riskCard, isFixed && styles.riskCardFixed]}
              >
                <View style={styles.riskCardTop}>
                  <View style={styles.riskBadge}>
                    <TrendingDown color={colors.danger} size={14} />
                    <Text style={styles.riskBadgeText}>{item.margin_pct}% Margin</Text>
                  </View>
                  <Text style={styles.riskStore}>{item.store}</Text>
                </View>

                <Text style={styles.riskName}>{item.name}</Text>
                <Text style={styles.riskSku}>SKU: {item.sku} • {item.category}</Text>

                <View style={styles.pricingComparisonRow}>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceBoxLabel}>Current Price</Text>
                    <Text style={styles.priceBoxValue}>{formatCurrency(item.selling_price)}</Text>
                  </View>

                  <View style={styles.priceBox}>
                    <Text style={styles.priceBoxLabel}>Cost Price</Text>
                    <Text style={[styles.priceBoxValue, { color: colors.danger }]}>
                      {formatCurrency(item.cost_price)}
                    </Text>
                  </View>

                  <View style={styles.priceBox}>
                    <Text style={styles.priceBoxLabel}>Loss / Unit</Text>
                    <Text style={[styles.priceBoxValue, { color: colors.danger }]}>
                      -{formatCurrency(item.loss_amount)}
                    </Text>
                  </View>
                </View>

                {isFixed ? (
                  <View style={styles.fixedBanner}>
                    <CheckCircle2 color={colors.success} size={14} />
                    <Text style={styles.fixedBannerText}>
                      Floor Price adjusted to {formatCurrency(item.suggested_price)}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.fixPriceBtn}
                    onPress={() => handleFixPrice(item.id, item.name, item.suggested_price)}
                    activeOpacity={0.8}
                  >
                    <Sparkles color="#02040a" size={14} />
                    <Text style={styles.fixPriceBtnText}>
                      Apply AI Recommended Price: {formatCurrency(item.suggested_price)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Stockout Alerts Tab */}
      {activeTab === 'stockout' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DAYS OF SUPPLY PREDICTOR</Text>
            <Text style={styles.sectionBadgeText}>Predicted replenishment runouts</Text>
          </View>

          {stockoutAlerts.map((so) => {
            const isCritical = so.risk_level === 'CRITICAL';
            const statusColor = isCritical ? colors.danger : colors.warning;
            return (
              <View key={so.id} style={styles.stockCard}>
                <View style={styles.stockTopRow}>
                  <View
                    style={[styles.supplyBadge, { backgroundColor: `${statusColor}18` }]}
                  >
                    <Clock color={statusColor} size={13} />
                    <Text style={[styles.supplyText, { color: statusColor }]}>
                      {so.days_of_supply} Days Supply
                    </Text>
                  </View>
                  <Text style={styles.stockStore}>{so.store}</Text>
                </View>

                <Text style={styles.stockName}>{so.name}</Text>
                <Text style={styles.stockSku}>SKU: {so.sku}</Text>

                <View style={styles.stockVelocityRow}>
                  <View style={styles.stockVelocityBox}>
                    <Text style={styles.velocityLabel}>On-Hand Stock</Text>
                    <Text style={styles.velocityVal}>{so.current_stock} units</Text>
                  </View>
                  <View style={styles.stockVelocityBox}>
                    <Text style={styles.velocityLabel}>Sales Velocity</Text>
                    <Text style={styles.velocityVal}>{so.daily_sales_velocity} / day</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.restockBtn}
                  onPress={() =>
                    Alert.alert(
                      'Restock Requisition',
                      `Automated replenishment PO generated for ${so.name} at ${so.store}.`
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.restockBtnText}>Create Restock PO</Text>
                  <ArrowRight color={colors.primary} size={14} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* AI Prescriptive Engine Tab */}
      {activeTab === 'ai' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AUTONOMOUS RETAIL ACTIONS</Text>
            <Text style={styles.sectionBadgeText}>3 recommendations available</Text>
          </View>

          {aiInsights.map((insight) => (
            <View key={insight.id} style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiTypeTag}>
                  <Sparkles color={colors.primary} size={13} />
                  <Text style={styles.aiTypeText}>OPPORTUNITY</Text>
                </View>
                <View style={styles.impactBadge}>
                  <Text style={styles.impactText}>{insight.impact_amount}</Text>
                </View>
              </View>

              <Text style={styles.aiTitle}>{insight.title}</Text>
              <Text style={styles.aiRec}>{insight.recommendation}</Text>

              <View style={styles.aiFooter}>
                <View style={styles.confidenceRow}>
                  <ShieldAlert color={colors.textMuted} size={12} />
                  <Text style={styles.confidenceText}>
                    AI Confidence: {insight.confidence_score}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.applyRecBtn}
                  onPress={() =>
                    Alert.alert('Action Queued', `AI Strategy deployed to relevant POS registers.`)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.applyRecText}>Execute Action</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: colors.textPrimary,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionBadgeText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  riskCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  riskCardFixed: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  riskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskBadgeText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  riskStore: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  riskName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  riskSku: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  pricingComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  priceBox: {
    alignItems: 'center',
    flex: 1,
  },
  priceBoxLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  priceBoxValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  fixPriceBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  fixPriceBtnText: {
    color: '#02040a',
    fontSize: 11,
    fontWeight: '800',
  },
  fixedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  fixedBannerText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  stockCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 16,
  },
  stockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  supplyText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stockStore: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  stockName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  stockSku: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  stockVelocityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  stockVelocityBox: {
    flex: 1,
  },
  velocityLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  velocityVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  restockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  restockBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  aiCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderRadius: 16,
    padding: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTypeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  impactBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  impactText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  aiTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  aiRec: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  aiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  applyRecBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applyRecText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
});
