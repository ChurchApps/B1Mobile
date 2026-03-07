import { View, StyleSheet } from "react-native";
import { BibleReaderView } from "@youversion/platform-react-native";
import { useThemeColors } from "@/theme";

const Bible = () => {
  const tc = useThemeColors();
  return (
  <View style={[styles.container, { backgroundColor: tc.surface }]}>
    <BibleReaderView appName="B1 Church" signInMessage="Sign in with YouVersion to access your highlights and bookmarks" />
  </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#fff" } });

export default Bible;
