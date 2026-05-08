import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useThemeColors } from "@/theme";
import { Text, Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import { getYouVersionModule } from "@/helpers/YouVersionHelper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Bible = () => {
  const tc = useThemeColors();
  const insets = useSafeAreaInsets();

  const BibleReaderView = getYouVersionModule()?.BibleReaderView ?? null;
  const androidInsetCompensation = Platform.OS === "android"
    ? { marginTop: -insets.top }
    : null;

  return (
    <View style={[styles.container, { backgroundColor: tc.surface }]}>
      {BibleReaderView ? (
        <View style={[styles.readerContainer, androidInsetCompensation]}>
          <BibleReaderView appName="B1 Church" signInMessage="Sign in with YouVersion to access your highlights and bookmarks" />
        </View>
      ) : (
        <View style={styles.fallback}>
          <Text variant="titleMedium" style={[styles.fallbackTitle, { color: tc.text }]}>
            Bible reader unavailable
          </Text>
          <Text variant="bodyMedium" style={[styles.fallbackBody, { color: tc.textSecondary }]}>
            This build doesn’t include the YouVersion native module. You can still open the Bible in the browser.
          </Text>
          <Button
            mode="contained"
            onPress={() => WebBrowser.openBrowserAsync("https://www.bible.com")}
            style={styles.fallbackButton}
          >
            Open Bible.com
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  readerContainer: { flex: 1, overflow: "hidden" },
  fallback: { flex: 1, padding: 20, justifyContent: "center" },
  fallbackTitle: { marginBottom: 8, textAlign: "center" },
  fallbackBody: { marginBottom: 16, textAlign: "center" },
  fallbackButton: { alignSelf: "center" }
});

export default Bible;
