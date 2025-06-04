import React from 'react';
import WebView from 'react-native-webview';
import { Surface } from 'react-native-paper';
import { useAppTheme } from '@/src/theme';

const Privacy = () => {
  const { theme, spacing } = useAppTheme();
  return (
    <Surface style={{ flex: 1, margin: spacing.md, borderRadius: theme.roundness, overflow: 'hidden' }}>
      <WebView source={{ uri: 'https://churchapps.org/privacy' }} style={{ flex: 1 }} />
    </Surface>
  );
}

export default Privacy;
