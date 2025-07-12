import React, { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/theme';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallbackText?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallbackText = "Loading..." 
}) => {
  const theme = useAppTheme();

  const LoadingFallback = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20
    }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ 
        marginTop: 16, 
        color: theme.colors.onSurface,
        fontSize: 16 
      }}>
        {fallbackText}
      </Text>
    </View>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};