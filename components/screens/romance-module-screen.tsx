import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useInsightsStore, SelfInsight } from '@/store';
import { OraaColors, Radii, Shadows } from '@/constants/theme';
import { InsightAdviceModal } from '@/components/insights/insight-advice-modal';
import { ROMANCE_MODULE_DESCRIPTION, ROMANCE_SUBDOMAIN_DESCRIPTIONS } from '@/constants/domain-definitions';

// Romance subdomains (from INSIGHTS_LIBRARY_STRUCTURE.md)
const ROMANCE_SUBDOMAINS = [
  { slug: 'attachment_security', name: 'Attachment & Security', icon: '💕' },
  { slug: 'intimacy_sex', name: 'Intimacy & Sex', icon: '🔥' },
  { slug: 'commitment_future', name: 'Commitment & Future', icon: '💍' },
  { slug: 'jealousy_attention_comparison', name: 'Jealousy, Attention & Comparison', icon: '👀' },
  { slug: 'roles_labor_power_balance', name: 'Roles, Labor & Power Balance', icon: '⚖️' },
  { slug: 'conflict_repair_romance', name: 'Conflict & Repair (Romance)', icon: '💔' },
  { slug: 'communication_vulnerability', name: 'Communication & Vulnerability', icon: '💬' },
  { slug: 'stages_transitions', name: 'Stages & Transitions', icon: '🔄' },
];

interface SubdomainCardProps {
  subdomain: typeof ROMANCE_SUBDOMAINS[0];
  insights: SelfInsight[];
  onInsightPress: (insight: SelfInsight) => void;
}

function SubdomainCard({ subdomain, insights, onInsightPress }: SubdomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeInsights = insights.filter(i => i.user_response !== 'no');
  const activeCount = activeInsights.length;
  const subdomainDescription = ROMANCE_SUBDOMAIN_DESCRIPTIONS[subdomain.slug] || '';
  
  return (
    <View style={styles.subdomainCard}>
      <TouchableOpacity 
        style={styles.subdomainHeader} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.subdomainHeaderLeft}>
          <Text style={styles.subdomainIcon}>{subdomain.icon}</Text>
          <View style={styles.subdomainHeaderText}>
            <Text style={styles.subdomainName}>{subdomain.name}</Text>
            {isExpanded && subdomainDescription ? (
              <Text style={styles.subdomainDescription}>{subdomainDescription}</Text>
            ) : null}
            <Text style={styles.insightCount}>
              {activeCount} {activeCount === 1 ? 'insight' : 'insights'}
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.subdomainContent}>
          {/* Subdomain synopsis placeholder */}
          {activeCount > 0 && (
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsisLabel}>Your patterns in this area</Text>
              <Text style={styles.synopsisText}>
                {/* TODO: Generate personalized synopsis from insights */}
                Your insights here show {activeCount === 1 ? 'one clear pattern' : `${activeCount} related patterns`} in romantic relationships.
              </Text>
            </View>
          )}
          
          {activeInsights.length === 0 ? (
            <Text style={styles.emptySubdomain}>No insights in this area yet.</Text>
          ) : (
            <View style={styles.insightsList}>
              {activeInsights.map((insight) => (
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
                    </View>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function RomanceModuleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  
  const { mapInsights, isLoadingMap, fetchMapInsights } = useInsightsStore();
  const [selectedInsight, setSelectedInsight] = useState<SelfInsight | null>(null);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  
  useEffect(() => {
    fetchMapInsights();
  }, []);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleInsightPress = (insight: SelfInsight) => {
    setSelectedInsight(insight);
    setShowAdviceModal(true);
  };
  
  // Group insights by romance subdomain (for now, using dummy grouping)
  // TODO: Fetch romance-specific insights from API
  const subdomainInsights: Record<string, SelfInsight[]> = {};
  ROMANCE_SUBDOMAINS.forEach(subdomain => {
    subdomainInsights[subdomain.slug] = [];
  });
  
  // For now, show empty state - will be populated when API returns romance-tagged insights
  const totalInsights = Object.values(subdomainInsights).reduce((sum, insights) => sum + insights.length, 0);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Romance & Love</Text>
          <Text style={styles.moduleDescription}>{ROMANCE_MODULE_DESCRIPTION}</Text>
          <Text style={styles.subtitle}>
            {ROMANCE_SUBDOMAINS.length} areas • {totalInsights} insights
          </Text>
        </View>
      </View>
      
      {/* Content */}
      {isLoadingMap ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OraaColors.blue} />
          <Text style={styles.loadingText}>Loading...</Text>
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
          {/* Module synopsis placeholder */}
          {totalInsights > 0 && (
            <View style={styles.moduleSynopsisContainer}>
              <Text style={styles.synopsisLabel}>Your patterns in romantic relationships</Text>
              <Text style={styles.synopsisText}>
                {/* TODO: Generate personalized synopsis from romance insights */}
                Your insights here show patterns across {Object.values(subdomainInsights).filter(insights => insights.length > 0).length} {Object.values(subdomainInsights).filter(insights => insights.length > 0).length === 1 ? 'area' : 'areas'} of romantic relationships.
              </Text>
            </View>
          )}
          
          <View style={styles.subdomainList}>
            {ROMANCE_SUBDOMAINS.map((subdomain) => (
              <SubdomainCard
                key={subdomain.slug}
                subdomain={subdomain}
                insights={subdomainInsights[subdomain.slug] || []}
                onInsightPress={handleInsightPress}
              />
            ))}
          </View>
          
          {totalInsights === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💕</Text>
              <Text style={styles.emptyTitle}>No romance insights yet</Text>
              <Text style={styles.emptyText}>
                As you discuss romantic relationships in conversations, insights will appear here.
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: OraaColors.text,
    fontWeight: '300',
  },
  headerContent: {
    paddingLeft: 44,
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
  moduleDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  moduleSynopsisContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: OraaColors.surfaceSubtle,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
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
  subdomainList: {
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
  subdomainCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  subdomainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subdomainHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  subdomainHeaderText: {
    flex: 1,
  },
  subdomainIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  subdomainName: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
  },
  subdomainDescription: {
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
  subdomainContent: {
    paddingTop: 12,
  },
  synopsisContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    marginBottom: 12,
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
  emptySubdomain: {
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

