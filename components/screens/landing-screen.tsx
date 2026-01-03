import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OraaLogo } from '@/components/oraa-logo';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { FAQItem } from '@/components/ui/faq-item';
import { TopicCloud } from '@/components/topic-cloud';
import { OraaColors, Spacing } from '@/constants/theme';

// FAQ content
const FAQ_DATA = [
  {
    key: 'why-oraa',
    question: 'Why Oraa?',
    answer: "You already think about this stuff all the time—the same loops, the same conversations with yourself that never quite resolve. The problem isn't that you're not thinking about it. It's that you're thinking about it alone. Oraa gives you someone to think with whenever you need it.",
  },
  {
    key: 'whats-it-like',
    question: "What's it like?",
    answer: "Think: the friend who gives great advice because they're honest, not just nice. Most AI tells you what it thinks you want to hear. Oraa listens, but it also pushes back when something doesn't add up. Not a yes-man. Not a therapist. Just someone real to think with.",
  },
  {
    key: 'understand-myself',
    question: 'How can it help me understand myself?',
    answer: "Oraa builds a picture of you over time—your patterns, your triggers, what tends to come up again and again. It's not just conversation by conversation. You get an overview of yourself that helps you spot loops and blind spots you might miss on your own. Think of it as a mirror that actually pays attention.",
  },
  {
    key: 'is-this-therapy',
    question: 'Is this therapy?',
    answer: "No—and it's not trying to be. Oraa is for the everyday stuff a good friend could help you work through. Think of it like journaling, but your thoughts actually respond. For anything deeper, there are professionals—and we'll always encourage you to reach out.",
  },
  {
    key: 'is-it-private',
    question: 'Is it private?',
    answer: "Yes. We don't sell your data, share it, or use it to train models. You can use Oraa without an account and delete your conversations anytime. Private by default—because the things you're working through deserve that.",
  },
];

interface LandingScreenProps {
  onContinueAnonymously?: () => void;
  onCreateAccount?: () => void;
}

export function LandingScreen({
  onContinueAnonymously,
  onCreateAccount,
}: LandingScreenProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View style={styles.brandRow}>
          <OraaLogo size={132} animated />
          <Text style={styles.brandName}>Oraa</Text>
        </View>
        
        {/* Hero text */}
        <Text style={styles.heading}>
          Talk it out.{'\n'}Feel a little lighter. ✨
        </Text>
        
        <Text style={styles.copy}>
          For the conversations you usually have with yourself. Slow your thoughts down, see them more clearly, and understand yourself through real talk, gentle pushback when it matters, and honest reflection.
        </Text>
        
        {/* Topic cloud */}
        <TopicCloud />
        
        {/* FAQ section */}
        <View style={styles.faq}>
          {FAQ_DATA.map((item) => (
            <FAQItem
              key={item.key}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>
        
        {/* Disclaimer pill */}
        <View style={styles.pillContainer}>
          <Pill>Emotional support, not therapy.</Pill>
        </View>
      </ScrollView>
      
      {/* Fixed bottom actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="Continue anonymously"
          variant="primary"
          onPress={onContinueAnonymously}
        />
        <Button
          title="Create account"
          variant="secondary"
          onPress={onCreateAccount}
        />
        <Text style={styles.footer}>
          Private by default. You can save later if you want.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
    color: 'rgba(255,255,255,0.94)',
    marginLeft: -14,
  },
  heading: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: OraaColors.text,
    marginBottom: 10,
  },
  copy: {
    fontSize: 15,
    lineHeight: 21.75,
    color: OraaColors.textSub,
    maxWidth: 330,
  },
  faq: {
    marginTop: 14,
    gap: 8,
  },
  pillContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  actions: {
    paddingHorizontal: 22,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
    backgroundColor: OraaColors.bg,
  },
  footer: {
    marginTop: 4,
    fontSize: 12,
    color: OraaColors.textMuted,
    textAlign: 'center',
    lineHeight: 16.2,
  },
});

