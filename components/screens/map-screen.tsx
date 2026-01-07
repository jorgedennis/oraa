import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useInsightsStore, DomainWithInsights, SelfInsight } from '@/store';
import { OraaColors, Radii, Shadows } from '@/constants/theme';
import { InsightAdviceModal } from '@/components/insights/insight-advice-modal';
import { DOMAIN_DESCRIPTIONS, SUBDOMAIN_DESCRIPTIONS } from '@/constants/domain-definitions';

// Domain Card Component
interface DomainCardProps {
  domain: DomainWithInsights;
  onInsightPress: (insight: SelfInsight) => void;
  onDeleteInsight: (insightId: string) => void;
}

function DomainCard({ domain, onInsightPress, onDeleteInsight }: DomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  
  // Separate insights into active and dismissed (user said "No")
  const activeInsights = domain.insights.filter(i => i.user_response !== 'no');
  const dismissedInsights = domain.insights.filter(i => i.user_response === 'no');
  
  // Group insights by category
  const insightsByCategory: Record<string, SelfInsight[]> = {};
  activeInsights.forEach(insight => {
    const categoryKey = insight.category_name || insight.subcategory || 'Other';
    if (!insightsByCategory[categoryKey]) {
      insightsByCategory[categoryKey] = [];
    }
    insightsByCategory[categoryKey].push(insight);
  });
  
  const activeCount = activeInsights.length;
  const dismissedCount = dismissedInsights.length;
  const totalCount = domain.insights.length;
  const categoryKeys = Object.keys(insightsByCategory);
  
  const domainDescription = DOMAIN_DESCRIPTIONS[domain.domain_id] || '';
  
  return (
    <View style={styles.domainCard}>
      <TouchableOpacity 
        style={styles.domainHeader} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.domainHeaderLeft}>
          <Text style={styles.domainIcon}>{domain.domain_icon}</Text>
          <View style={styles.domainHeaderText}>
            <Text style={styles.domainName}>{domain.domain_name}</Text>
            {isExpanded && domainDescription ? (
              <Text style={styles.domainDescription}>{domainDescription}</Text>
            ) : null}
            <Text style={styles.insightCount}>
              {activeCount} {activeCount === 1 ? 'insight' : 'insights'}
              {dismissedCount > 0 && ` • ${dismissedCount} dismissed`}
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.domainContent}>
          {/* Domain synopsis placeholder */}
          {activeCount > 0 && (
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsisLabel}>Your patterns in this domain</Text>
              <Text style={styles.synopsisText}>
                {/* TODO: Generate personalized synopsis from insights */}
                Your insights here show patterns across {categoryKeys.length} {categoryKeys.length === 1 ? 'area' : 'areas'}.
              </Text>
            </View>
          )}
          
          {totalCount === 0 ? (
            <Text style={styles.emptyDomain}>No insights in this domain yet.</Text>
          ) : (
            <>
              {/* Grouped by category/subdomain */}
              {categoryKeys.map((categoryKey) => {
                const categoryInsights = insightsByCategory[categoryKey];
                const subdomainDesc = SUBDOMAIN_DESCRIPTIONS[domain.domain_id]?.[categoryKey] || '';
                const categoryCount = categoryInsights.length;
                
                return (
                  <View key={categoryKey} style={styles.categoryGroup}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryLabel}>{categoryKey}</Text>
                      {subdomainDesc && (
                        <Text style={styles.categoryDescription}>{subdomainDesc}</Text>
                      )}
                      <Text style={styles.categoryInsightCount}>
                        {categoryCount} {categoryCount === 1 ? 'insight' : 'insights'}
                      </Text>
                    </View>
                    
                    {/* Category synopsis placeholder */}
                    {categoryCount > 0 && (
                      <View style={styles.categorySynopsisContainer}>
                        <Text style={styles.categorySynopsisText}>
                          {/* TODO: Generate personalized synopsis for this category */}
                          Your patterns here show {categoryCount === 1 ? 'one clear pattern' : `${categoryCount} related patterns`}.
                        </Text>
                      </View>
                    )}
                    
                    {/* Insights list */}
                    <View style={styles.categoryInsightsList}>
                      {categoryInsights.map((insight) => (
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
                                ]}>
                                  <Text style={[
                                    styles.responseBadgeText,
                                    insight.user_response === 'yes' && styles.responseBadgeTextYes,
                                    insight.user_response === 'maybe' && styles.responseBadgeTextMaybe,
                                  ]}>
                                    {insight.user_response === 'yes' ? 'Agreed' : 'Maybe'}
                                  </Text>
                                </View>
                              )}
                              {insight.is_novel && (
                                <View style={styles.novelBadge}>
                                  <Text style={styles.novelBadgeText}>Unique</Text>
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
                      ))}
                    </View>
                  </View>
                );
              })}
              
              {/* Dismissed insights toggle */}
              {dismissedCount > 0 && (
                <TouchableOpacity 
                  style={styles.dismissedToggle}
                  onPress={() => setShowDismissed(!showDismissed)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dismissedToggleText}>
                    {showDismissed ? 'Hide' : 'Show'} {dismissedCount} dismissed {dismissedCount === 1 ? 'insight' : 'insights'}
                  </Text>
                  <Text style={styles.dismissedToggleIcon}>{showDismissed ? '−' : '+'}</Text>
                </TouchableOpacity>
              )}
              
              {/* Dismissed insights (collapsed by default) */}
              {showDismissed && dismissedInsights.map((insight) => (
                <TouchableOpacity
                  key={insight.id}
                  style={[styles.insightItem, styles.insightItemDismissed]}
                  onPress={() => onInsightPress(insight)}
                  activeOpacity={0.7}
                >
                  <View style={styles.insightContent}>
                    <Text style={[styles.insightText, styles.insightTextDismissed]}>{insight.observation}</Text>
                    <View style={styles.insightMeta}>
                      <View style={[styles.responseBadge, styles.responseBadgeNo]}>
                        <Text style={[styles.responseBadgeText, styles.responseBadgeTextNo]}>
                          Disagreed
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.chevron, styles.chevronDismissed]}>›</Text>
                </TouchableOpacity>
              ))}
            </>
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
  const [selectedInsight, setSelectedInsight] = useState<SelfInsight | null>(null);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  
  useEffect(() => {
    fetchMapInsights();
  }, []);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleInsightPress = (insight: SelfInsight) => {
    // Open advice modal for the insight
    setSelectedInsight(insight);
    setShowAdviceModal(true);
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
            Your Map is Oraa's understanding of you across six core domains. 
            Self insights are portable patterns that apply across different areas of your life.
        </Text>
        
        {/* Deep Dives Section */}
        <View style={styles.deepDivesSection}>
          <Text style={styles.sectionTitle}>Deep Dives</Text>
          <TouchableOpacity 
            style={styles.deepDiveCard}
            activeOpacity={0.7}
            onPress={() => {
              router.push('/(drawer)/romance');
            }}
          >
            <View style={styles.deepDiveContent}>
              <Text style={styles.deepDiveIcon}>💕</Text>
              <View style={styles.deepDiveText}>
                <Text style={styles.deepDiveTitle}>Romance & Love</Text>
                <Text style={styles.deepDiveSubtitle}>View relationship patterns</Text>
              </View>
            </View>
            <Text style={styles.deepDiveChevron}>›</Text>
          </TouchableOpacity>
        </View>
        
        {/* Core Domains Section */}
        <View style={styles.coreDomainsSection}>
          <Text style={styles.sectionTitle}>Core Domains</Text>
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
      
      {/* Advice Modal */}
      <InsightAdviceModal
        visible={showAdviceModal}
        templateId={selectedInsight?.template_id || null}
        isNovel={selectedInsight?.is_novel ?? false}
        onClose={() => {
          setShowAdviceModal(false);
          setSelectedInsight(null);
        }}
      />
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
  deepDivesSection: {
    marginBottom: 32,
  },
  coreDomainsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 12,
  },
  deepDiveCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.soft,
  },
  deepDiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deepDiveIcon: {
    fontSize: 24,
  },
  deepDiveText: {
    flex: 1,
  },
  deepDiveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 2,
  },
  deepDiveSubtitle: {
    fontSize: 13,
    color: OraaColors.textMuted,
  },
  deepDiveChevron: {
    fontSize: 20,
    color: OraaColors.textMuted,
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
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  domainHeaderText: {
    flex: 1,
  },
  domainIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  domainName: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
  },
  domainDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
    marginTop: 4,
  },
  insightCount: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: 4,
  },
  domainContent: {
    paddingTop: 12,
  },
  synopsisContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    marginBottom: 12,
  },
  synopsisLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  synopsisText: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    fontStyle: 'italic',
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
  chevronDismissed: {
    opacity: 0.5,
  },
  novelBadge: {
    backgroundColor: 'rgba(147,112,219,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  novelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(147,112,219,0.9)',
  },
  insightItemDismissed: {
    opacity: 0.6,
    backgroundColor: OraaColors.surfaceSubtle,
  },
  insightTextDismissed: {
    color: OraaColors.textMuted,
  },
  dismissedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    backgroundColor: OraaColors.surfaceSubtle,
  },
  dismissedToggleText: {
    fontSize: 13,
    color: OraaColors.textMuted,
    fontStyle: 'italic',
  },
  dismissedToggleIcon: {
    fontSize: 16,
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
  categoryGroup: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
    marginBottom: 6,
  },
  categoryInsightCount: {
    fontSize: 12,
    color: OraaColors.textMuted,
    fontWeight: '500',
  },
  categorySynopsisContainer: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: OraaColors.blueBorderSoft,
  },
  categorySynopsisText: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
    fontStyle: 'italic',
    paddingLeft: 8,
  },
  categoryInsightsList: {
    gap: 0,
  },
});
