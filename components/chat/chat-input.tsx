import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

interface ChatInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  helperLeft?: string;
  helperRight?: string;
}

export function ChatInput({
  onSend,
  placeholder = "What's on your mind?",
  disabled = false,
  helperLeft,
  helperRight,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage('');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={OraaColors.textPlaceholder}
          multiline
          maxLength={2000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
          activeOpacity={0.7}
        >
          <View style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
      
      {(helperLeft || helperRight) && (
        <View style={styles.helper}>
          <Text style={styles.helperText}>{helperLeft}</Text>
          <Text style={[styles.helperText, styles.helperTextRight]}>{helperRight}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
    backgroundColor: OraaColors.surfaceHover,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...Shadows.soft,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: OraaColors.text,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: Radii.lg - 4,
    borderWidth: 1,
    borderColor: 'rgba(77,163,255,0.30)',
    backgroundColor: 'rgba(77,163,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderLeftWidth: 9,
    borderLeftColor: 'rgba(235,247,255,0.95)',
    marginLeft: 2,
  },
  helper: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  helperText: {
    fontSize: 12,
    color: OraaColors.textMuted,
  },
  helperTextRight: {
    opacity: 0.75,
  },
});

