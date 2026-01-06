import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useInsightsStore, DomainWithInsights, SelfInsight } from '@/store';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Domain Card Component
interface DomainCardProps {
  domain: DomainWithInsights;
  onInsightPress: (insight: SelfInsight) => void;
  onDeleteInsight: (insightId: string) => void;
}

function DomainCard({ domain, onInsightPress, onDeleteInsight }: DomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const insightCount = domain.insights.length;
  
  return (
    <View style={styles.domainCard}>
      <TouchableOpacity 
        style={styles.domainHeader} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.domainHeaderLeft}>
          <Text style={styles.domainIcon}>{domain.domain_icon}</Text>
          <View>
            <Text style={styles.domainName}>{domain.domain_name}</Text>
            <Text style={styles.insightCount}>
              {insightCount} {insightCount === 1 ? 'insight' : 'insights'}
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.insightsList}>
          {insightCount === 0 ? (
            <Text style={styles.emptyDomain}>No insights in this domain yet.</Text>
          ) : (
            domain.insights.map((insight) => (
              <TouchableOpacity
                key={insight.id}
                style={styles.insightItem}
                onPress={() => onInsightPress(insight)}
                activeOpacity={0.7}
              >
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>{insight.observation}</Text>
                  <View style={styles.insightMeta}>
                    {insight.user_response && (
                      <View style={[
                        styles.responseBadge,
                        insight.user_response === 'yes' && styles.responseBadgeYes,
                        insight.user_response === 'maybe' && styles.responseBadgeMaybe,
                        insight.user_response === 'no' && styles.responseBadgeNo,
                      ]}>
                        <Text style={[
                          styles.responseBadgeText,
                          insight.user_response === 'yes' && styles.responseBadgeTextYes,
                          insight.user_response === 'maybe' && styles.responseBadgeTextMaybe,
                          insight.user_response === 'no' && styles.responseBadgeTextNo,
                        ]}>
                          {insight.user_response === 'yes' ? 'Agreed' : 
                           insight.user_response === 'maybe' ? 'Maybe' : 'Disagreed'}
                        </Text>
                      </View>
                    )}
                    {insight.thread_associations.length > 0 && (
                      <Text style={styles.threadCount}>
                        {insight.thread_associations.length} {insight.thread_associations.length === 1 ? 'thread' : 'threads'}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  
  const { mapInsights, isLoadingMap, fetchMapInsights, deleteInsight } = useInsightsStore();
  
  useEffect(() => {
    fetchMapInsights();
  }, []);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleInsightPress = (insight: SelfInsight) => {
    // Navigate to insight detail screen
    router.push({
      pathname: '/(drawer)/map',
      params: { insightId: insight.id }
    });
  };
  
  const handleDeleteInsight = async (insightId: string) => {
    await deleteInsight(insightId);
  };
  
  // Calculate total insights
  const totalInsights = mapInsights.reduce((sum, domain) => sum + domain.insights.length, 0);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Your Map</Text>
            <Text style={styles.subtitle}>
              {mapInsights.length} domains • {totalInsights} insights
            </Text>
          </View>
        </View>
      </View>
      
      {/* Domain cards */}
      {isLoadingMap ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OraaColors.blue} />
          <Text style={styles.loadingText}>Loading your Map...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Your Map is Oraa's understanding of you across five domains. 
            Self insights are portable patterns that apply across different areas of your life.
          </Text>
          
          <View style={styles.domainList}>
            {mapInsights.map((domain) => (
              <DomainCard 
                key={domain.domain_id} 
                domain={domain}
                onInsightPress={handleInsightPress}
                onDeleteInsight={handleDeleteInsight}
              />
            ))}
          </View>
          
          {totalInsights === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyTitle}>Your Map is empty</Text>
              <Text style={styles.emptyText}>
                As we talk, Oraa will surface insights about your patterns. 
                Acknowledge them in the Insights tab to add them here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuButton: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: OraaColors.textSub,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: OraaColors.text,
  },
  subtitle: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    marginBottom: 20,
  },
  domainList: {
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: OraaColors.textMuted,
  },
  // Domain Card styles
  domainCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  domainHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  domainIcon: {
    fontSize: 24,
  },
  domainName: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
  },
  insightCount: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 20,
    color: OraaColors.textMuted,
    fontWeight: '300',
  },
  insightsList: {
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
  },
  emptyDomain: {
    padding: 16,
    fontSize: 14,
    color: OraaColors.textMuted,
    fontStyle: 'italic',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  insightContent: {
    flex: 1,
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    marginBottom: 8,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  responseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  responseBadgeYes: {
    backgroundColor: 'rgba(74,222,128,0.10)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  responseBadgeMaybe: {
    backgroundColor: 'rgba(250,204,21,0.10)',
    borderColor: 'rgba(250,204,21,0.25)',
  },
  responseBadgeNo: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  responseBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  responseBadgeTextYes: {
    color: 'rgba(74,222,128,0.9)',
  },
  responseBadgeTextMaybe: {
    color: 'rgba(250,204,21,0.9)',
  },
  responseBadgeTextNo: {
    color: 'rgba(248,113,113,0.9)',
  },
  threadCount: {
    fontSize: 11,
    color: OraaColors.textMuted,
  },
  chevron: {
    fontSize: 20,
    color: OraaColors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: OraaColors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
