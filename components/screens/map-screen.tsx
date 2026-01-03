import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { DomainCard, Domain } from '@/components/map/domain-card';
import { OraaColors } from '@/constants/theme';

// Mock data for the 7 domains
const DOMAINS: Domain[] = [
  {
    id: 'inner',
    name: 'Inner',
    icon: '🌀',
    analysis: 'You tend to process experiences internally before sharing them. There\'s a rich inner world here, sometimes at odds with what you show externally. Self-reflection is a strength, though it can tip into rumination.',
    insights: [
      { id: '1', text: 'You mentioned feeling like you\'re "performing" a version of yourself at work', status: 'agreed', date: 'Dec 28' },
      { id: '2', text: 'There\'s a pattern of overthinking decisions until the window closes', status: 'maybe', date: 'Dec 22' },
    ],
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: '💙',
    analysis: 'Anxiety shows up most often as a physical sensation first—tight chest, racing thoughts. You\'re learning to notice the early signs. Guilt is a recurring theme, especially around setting boundaries.',
    insights: [
      { id: '3', text: 'Stress manifests physically before you consciously recognize it', status: 'agreed', date: 'Dec 27' },
      { id: '4', text: 'You feel responsible for other people\'s emotional states', status: 'agreed', date: 'Dec 20' },
      { id: '5', text: 'Anger is the hardest emotion for you to express directly', status: 'disagreed', date: 'Dec 18' },
    ],
  },
  {
    id: 'relational',
    name: 'Relational',
    icon: '🤝',
    analysis: 'Close relationships are deeply important to you, but there\'s a pattern of giving more than you receive. Boundary-setting feels risky—like it might cost you the connection. You\'re working on believing relationships can survive honest needs.',
    insights: [
      { id: '6', text: 'You tend to anticipate others\' needs before they ask', status: 'agreed', date: 'Dec 26' },
      { id: '7', text: 'Conflict avoidance has sometimes led to resentment building up', status: 'maybe', date: 'Dec 21' },
    ],
  },
  {
    id: 'performing',
    name: 'Performing',
    icon: '🎯',
    analysis: 'High standards drive you, but they\'re often set by an internalized voice that\'s harsher than any external critic. You\'re capable and competent, yet imposter syndrome makes it hard to own your accomplishments.',
    insights: [
      { id: '8', text: 'Success often feels like "getting away with something"', status: 'agreed', date: 'Dec 25' },
      { id: '9', text: 'You compare your behind-the-scenes to others\' highlight reels', status: 'agreed', date: 'Dec 19' },
    ],
  },
  {
    id: 'embodied',
    name: 'Embodied',
    icon: '🧘',
    analysis: 'Your body often knows things before your mind catches up. Sleep and exercise directly impact your emotional regulation, but they\'re often the first things to slip when stressed.',
    insights: [
      { id: '10', text: 'Physical tension in your shoulders correlates with work stress', status: 'agreed', date: 'Dec 24' },
    ],
  },
  {
    id: 'temporal',
    name: 'Temporal',
    icon: '⏳',
    analysis: 'There\'s tension between who you are now and who you thought you\'d be by this point. The past sometimes feels more vivid than the present. You\'re learning to hold multiple timelines—where you\'ve been, where you are, where you\'re going.',
    insights: [
      { id: '11', text: 'Certain memories from childhood still feel emotionally charged', status: 'agreed', date: 'Dec 23' },
      { id: '12', text: 'Future-planning sometimes becomes a way to avoid present discomfort', status: 'maybe', date: 'Dec 17' },
    ],
  },
  {
    id: 'meaning',
    name: 'Meaning',
    icon: '✨',
    analysis: 'You\'re searching for work that matters, not just work that pays. There\'s a desire to contribute something lasting. The question "is this it?" surfaces more often than you\'d like.',
    insights: [
      { id: '13', text: 'Purpose feels tied to impact on others', status: 'agreed', date: 'Dec 22' },
      { id: '14', text: 'You question whether your current path aligns with your values', status: 'agreed', date: 'Dec 16' },
    ],
  },
];

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
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
            <Text style={styles.subtitle}>7 domains • Updated today</Text>
          </View>
        </View>
      </View>
      
      {/* Domain cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Your map is Oraa's understanding of you across seven domains. It evolves as we talk.
        </Text>
        
        <View style={styles.domainList}>
          {DOMAINS.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </View>
      </ScrollView>
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
});

