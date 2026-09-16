import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react-native';
import { colors } from './src/theme/colors';
import { AuthProvider } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { PaymentModal } from './src/components/PaymentModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type TabKey = 'home' | 'analytics' | 'insights' | 'profile';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');

  const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
    { key: 'home', label: 'Overview', icon: LayoutDashboard },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'insights', label: 'AI Radar', icon: Zap },
    { key: 'profile', label: 'SaaS / Team', icon: ShieldCheck },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={colors.background} />

      {/* Main Top Header */}
      <Header />

      {/* Main Active View */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && <HomeScreen onNavigateTab={(tab) => setCurrentTab(tab as TabKey)} />}
        {currentTab === 'analytics' && <AnalyticsScreen />}
        {currentTab === 'insights' && <InsightsScreen />}
        {currentTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const IconComponent = tab.icon;
          const activeColor =
            tab.key === 'insights'
              ? colors.warning
              : tab.key === 'analytics'
              ? colors.secondary
              : colors.primary;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setCurrentTab(tab.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabIconWrapper,
                  isActive && { backgroundColor: `${activeColor}15` },
                ]}
              >
                <IconComponent
                  color={isActive ? activeColor : colors.textMuted}
                  size={20}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? activeColor : colors.textMuted },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Global Payment & UPI QR Modal */}
      <PaymentModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
