import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OraaLogo } from '@/components/oraa-logo';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { FAQItem } from '@/components/ui/faq-item';
import { TopicCloud } from '@/components/topic-cloud';
import { OraaColors } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// Animation timing constants
const LOGO_ANIMATION_DURATION = 3000; // Logo dots resolve in 3s
const SLIDE_UP_DELAY = 3200; // Start slide after logo animation
const SLIDE_UP_DURATION = 800;
const BUBBLE_DELAY = 4000;
const BUBBLE_DURATION = 600;
const CONTENT_DELAY = 4800;
const CONTENT_DURATION = 500;

interface LandingScreenProps {
  onContinueAnonymously?: () => void;
  onCreateAccount?: () => void;
}

// Typewriter text component
function TypewriterText({ text, startDelay, style }: { text: string; startDelay: number; style?: any }) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timeout);
  }, [startDelay]);
  
  useEffect(() => {
    if (!started) return;
    
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(interval);
      }
    }, 35);
    
    return () => clearInterval(interval);
  }, [started, text]);
  
  return (
    <Text style={style}>
      {displayedText}
      {started && displayedText.length < text.length && (
        <Text style={{ color: OraaColors.blue }}>|</Text>
      )}
    </Text>
  );
}

export function LandingScreen({
  onContinueAnonymously,
  onCreateAccount,
}: LandingScreenProps) {
  const insets = useSafeAreaInsets();
  const [introComplete, setIntroComplete] = useState(false);
  
  // Animation values
  const logoPosition = useSharedValue(0); // 0 = centered, 1 = final position
  const bubbleProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Stage 1: Logo animation plays (handled by OraaLogo component)
    
    // Stage 2: Slide logo up after it resolves
    logoPosition.value = withDelay(
      SLIDE_UP_DELAY,
      withTiming(1, {
        duration: SLIDE_UP_DURATION,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );
    
    // Stage 3: Chat bubble pans up and appears
    bubbleProgress.value = withDelay(
      BUBBLE_DELAY,
      withTiming(1, {
        duration: BUBBLE_DURATION,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );
    
    // Stage 4: Content fades in
    contentOpacity.value = withDelay(
      CONTENT_DELAY,
      withTiming(1, {
        duration: CONTENT_DURATION,
        easing: Easing.out(Easing.ease),
      })
    );
    
    // Stage 5: Actions fade in
    actionsOpacity.value = withDelay(
      CONTENT_DELAY + 400,
      withTiming(1, {
        duration: CONTENT_DURATION,
        easing: Easing.out(Easing.ease),
      })
    );
    
    // Mark intro as complete
    const completeTimeout = setTimeout(() => {
      setIntroComplete(true);
    }, CONTENT_DELAY + 1000);
    
    return () => clearTimeout(completeTimeout);
  }, []);
  
  // Animated styles
  const logoContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      logoPosition.value,
      [0, 1],
      [SCREEN_HEIGHT * 0.35, 0] // Start from center, move to top
    );
    
    return {
      transform: [{ translateY }],
    };
  });
  
  const bubbleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      bubbleProgress.value,
      [0, 1],
      [40, 0]
    );
    const opacity = bubbleProgress.value;
    const scale = interpolate(
      bubbleProgress.value,
      [0, 1],
      [0.9, 1]
    );
    
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });
  
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(
          contentOpacity.value,
          [0, 1],
          [20, 0]
        ),
      },
    ],
  }));
  
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: 180 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEnabled={introComplete}
      >
        {/* Animated Brand header */}
        <Animated.View style={[styles.brandRow, logoContainerStyle]}>
          <OraaLogo size={132} animated />
          <Text style={styles.brandName}>Oraa</Text>
        </Animated.View>
        
        {/* Animated Chat bubble */}
        <Animated.View style={[styles.bubbleContainer, bubbleStyle]}>
          <View style={styles.bubble}>
            <TypewriterText
              text="What's on your mind?"
              startDelay={BUBBLE_DELAY + 200}
              style={styles.heading}
            />
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>
        
        {/* Animated Content */}
        <Animated.View style={contentStyle}>
          <Text style={styles.copy}>
            For the conversations you usually have with yourself. Slow your thoughts down, see them more clearly, and understand yourself through real talk, gentle pushback when it matters, and honest reflection.
          </Text>
          
          {/* Topic cloud */}
          <TopicCloud />
          
          {/* FAQ section */}
          <View style={styles.faq}>
            {FAQ_DATA.map((item, index) => (
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
        </Animated.View>
      </ScrollView>
      
      {/* Fixed bottom actions */}
      <Animated.View style={[styles.actions, { paddingBottom: insets.bottom + 20 }, actionsStyle]}>
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
      </Animated.View>
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
  bubbleContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(77,163,255,0.25)',
    borderRadius: 24,
    borderBottomLeftRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#4DA3FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 64,
  },
  bubbleTail: {
    width: 16,
    height: 16,
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(77,163,255,0.25)',
    transform: [{ rotate: '-45deg' }],
    marginTop: -9,
    marginLeft: 20,
    borderBottomLeftRadius: 4,
  },
  heading: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: 'rgba(235,247,255,0.98)',
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
