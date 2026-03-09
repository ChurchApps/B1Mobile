import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const EMOJI_CATEGORIES = [
  {
    label: "Smileys",
    emojis: [
      "\u{1F600}", "\u{1F601}", "\u{1F602}", "\u{1F603}", "\u{1F604}", "\u{1F605}", "\u{1F606}", "\u{1F609}", "\u{1F60A}", "\u{1F607}",
      "\u{1F60D}", "\u{1F618}", "\u{1F61C}", "\u{1F61D}", "\u{1F60E}", "\u{1F917}", "\u{1F914}", "\u{1F644}", "\u{1F612}", "\u{1F62C}",
      "\u{1F625}", "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F621}", "\u{1F92F}", "\u{1F632}", "\u{1F634}", "\u{1F637}", "\u{1F92B}"
    ]
  },
  {
    label: "Gestures",
    emojis: [
      "\u{1F44D}", "\u{1F44E}", "\u{1F44F}", "\u{1F64C}", "\u{1F64F}", "\u{1F4AA}", "\u{270B}", "\u{1F44B}", "\u{1F91E}", "\u{1F44A}",
      "\u{1F91D}", "\u{261D}\uFE0F", "\u{1F446}", "\u{1F447}"
    ]
  },
  {
    label: "Hearts & Symbols",
    emojis: [
      "\u{2764}\uFE0F", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{2B50}", "\u{1F525}", "\u{2705}", "\u{274C}",
      "\u{2753}", "\u{1F4AF}"
    ]
  },
  {
    label: "Objects",
    emojis: [
      "\u{1F389}", "\u{1F388}", "\u{1F381}", "\u{1F3B5}", "\u{1F4E3}", "\u{1F4F7}", "\u{2615}", "\u{1F37D}\uFE0F", "\u{1F4D6}", "\u{1F4A1}",
      "\u{26EA}", "\u{1F3B6}"
    ]
  }
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="always">
        {EMOJI_CATEGORIES.map((cat) => (
          <View key={cat.label} style={styles.category}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{cat.label}</Text>
            <View style={styles.grid}>
              {cat.emojis.map((emoji, i) => (
                <TouchableOpacity key={i} onPress={() => onSelect(emoji)} style={styles.emojiButton}>
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 250,
    borderTopWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    elevation: 2,
  },
  scroll: {
    padding: 8,
  },
  category: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emojiButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
});
