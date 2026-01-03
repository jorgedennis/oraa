import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface Insight {
  id: string;
  text: string;
  status: 'agreed' | 'maybe' | 'disagreed';
  date: string;
}

export interface Domain {
  id: string;
  name: string;
  icon: string;
  analysis: string;
  insights: Insight[];
}

interface DomainCardProps {
  domain: Domain;
  defaultExpanded?: boolean;
}

function InsightBadge({ status }: { status: Insight['status'] }) {
  const colors = {
    agreed: { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.30)', text: 'rgba(74,222,128,0.9)' },
    maybe: { bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.30)', text: 'rgba(250,204,21,0.9)' },
    disagreed: { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.30)', text: 'rgba(248,113,113,0.9)' },
  };
  
  const labels = { agreed: '✓', maybe: '~', disagreed: '✗' };
  const color = colors[status];
  
  return (
    <View style={[styles.insightBadge, { backgroundColor: color.bg, borderColor: color.border }]}>
      <Text style={[styles.insightBadgeText, { color: color.text }]}>{labels[status]}</Text>
    </View>
  );
}

export function DomainCard({ domain, defaultExpanded = false }: DomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 90 : 0);
  
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
    rotation.value = withTiming(isExpanded ? 0 : 90, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };
  
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  const insightCounts = {
    agreed: domain.insights.filter(i => i.status === 'agreed').length,
    maybe: domain.insights.filter(i => i.status === 'maybe').length,
    disagreed: domain.insights.filter(i => i.status === 'disagreed').length,
  };
  
  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{domain.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.name}>{domain.name}</Text>
            <Text style={styles.insightCount}>
              {domain.insights.length} insight{domain.insights.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <Animated.Text style={[styles.chevron, chevronStyle]}>›</Animated.Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {/* Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.sectionLabel}>Current Understanding</Text>
            <Text style={styles.analysis}>{domain.analysis}</Text>
          </View>
          
          {/* Insight summary */}
          {domain.insights.length > 0 && (
            <View style={styles.insightSummary}>
              {insightCounts.agreed > 0 && (
                <View style={styles.summaryItem}>
                  <InsightBadge status="agreed" />
                  <Text style={styles.summaryText}>{insightCounts.agreed} agreed</Text>
                </View>
              )}
              {insightCounts.maybe > 0 && (
                <View style={styles.summaryItem}>
                  <InsightBadge status="maybe" />
                  <Text style={styles.summaryText}>{insightCounts.maybe} nuanced</Text>
                </View>
              )}
              {insightCounts.disagreed > 0 && (
                <View style={styles.summaryItem}>
                  <InsightBadge status="disagreed" />
                  <Text style={styles.summaryText}>{insightCounts.disagreed} disagreed</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Insights list */}
          <View style={styles.insightsList}>
            <Text style={styles.sectionLabel}>Supporting Insights</Text>
            {domain.insights.map((insight) => (
              <View key={insight.id} style={styles.insightItem}>
                <InsightBadge status={insight.status} />
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>{insight.text}</Text>
                  <Text style={styles.insightDate}>{insight.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  containerExpanded: {
    backgroundColor: OraaColors.surface,
    borderColor: 'rgba(77,163,255,0.20)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
  },
  insightCount: {
    fontSize: 12,
    color: OraaColors.textMuted,
  },
  chevron: {
    fontSize: 24,
    color: OraaColors.textMuted,
    fontWeight: '300',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  analysisSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysis: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
  },
  insightSummary: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: OraaColors.stroke,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 12,
    color: OraaColors.textMuted,
  },
  insightsList: {
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  insightBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  insightBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
  },
  insightDate: {
    fontSize: 11,
    color: OraaColors.textMuted,
  },
});

