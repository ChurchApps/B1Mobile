import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColors } from "@/theme";
import { Text, Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";

const Bible = () => {
  const tc = useThemeColors();

  let BibleReaderView: React.ComponentType<any> | null = null;
  try {

    BibleReaderView = require("@youversion/platform-react-native")?.BibleReaderView ?? null;
  } catch {
    BibleReaderView = null;
  }

  return (
    <View style={[styles.container, { backgroundColor: tc.surface }]}>
      {BibleReaderView ? (
        <BibleReaderView appName="B1 Church" signInMessage="Sign in with YouVersion to access your highlights and bookmarks" />
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
  fallback: { flex: 1, padding: 20, justifyContent: "center" },
  fallbackTitle: { marginBottom: 8, textAlign: "center" },
  fallbackBody: { marginBottom: 16, textAlign: "center" },
  fallbackButton: { alignSelf: "center" }
});

export default Bible;
