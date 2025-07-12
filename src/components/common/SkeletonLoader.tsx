import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useAppTheme } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const theme = useAppTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceVariant, theme.colors.outline],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    }}>
      <SkeletonItem height={24} width="70%" style={{ marginBottom: 12 }} />
      <SkeletonItem height={16} width="100%" style={{ marginBottom: 8 }} />
      <SkeletonItem height={16} width="85%" style={{ marginBottom: 8 }} />
      <SkeletonItem height={16} width="60%" />
    </View>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

export const SkeletonDonationForm: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      margin: 16,
      elevation: 2,
    }}>
      {/* Amount input skeleton */}
      <SkeletonItem height={24} width="40%" style={{ marginBottom: 8 }} />
      <SkeletonItem height={56} width="100%" borderRadius={8} style={{ marginBottom: 20 }} />
      
      {/* Fund selection skeleton */}
      <SkeletonItem height={20} width="30%" style={{ marginBottom: 8 }} />
      <SkeletonItem height={48} width="100%" borderRadius={8} style={{ marginBottom: 20 }} />
      
      {/* Payment method skeleton */}
      <SkeletonItem height={20} width="45%" style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <SkeletonItem height={48} width={120} borderRadius={8} />
        <SkeletonItem height={48} width={120} borderRadius={8} />
      </View>
      
      {/* Submit button skeleton */}
      <SkeletonItem height={48} width="100%" borderRadius={8} />
    </View>
  );
};

export const SkeletonGivingHistory: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      elevation: 2,
    }}>
      <SkeletonItem height={28} width="60%" style={{ marginBottom: 16 }} />
      
      {/* History items */}
      {Array.from({ length: 4 }, (_, index) => (
        <View key={index} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: index < 3 ? 1 : 0,
          borderBottomColor: theme.colors.outline,
        }}>
          <View style={{ flex: 1 }}>
            <SkeletonItem height={18} width="70%" style={{ marginBottom: 6 }} />
            <SkeletonItem height={14} width="50%" />
          </View>
          <SkeletonItem height={20} width={80} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonPlanItem: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      elevation: 2,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <SkeletonItem height={24} width="60%" />
        <SkeletonItem height={20} width={60} borderRadius={10} />
      </View>
      
      {/* Content */}
      <SkeletonItem height={16} width="100%" style={{ marginBottom: 8 }} />
      <SkeletonItem height={16} width="80%" style={{ marginBottom: 12 }} />
      
      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SkeletonItem height={36} width={100} borderRadius={8} />
        <SkeletonItem height={36} width={100} borderRadius={8} />
      </View>
    </View>
  );
};

export const SkeletonSermonCard: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }}>
      {/* Thumbnail */}
      <SkeletonItem 
        height={200} 
        width="100%" 
        borderRadius={8} 
        style={{ marginBottom: 12 }} 
      />
      
      {/* Title */}
      <SkeletonItem height={20} width="90%" style={{ marginBottom: 8 }} />
      
      {/* Subtitle/Date */}
      <SkeletonItem height={16} width="70%" style={{ marginBottom: 12 }} />
      
      {/* Play button */}
      <SkeletonItem height={40} width={120} borderRadius={20} />
    </View>
  );
};

export const SkeletonProfileHeader: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: 20,
      alignItems: 'center',
    }}>
      {/* Avatar */}
      <SkeletonItem 
        height={80} 
        width={80} 
        borderRadius={40} 
        style={{ marginBottom: 16 }} 
      />
      
      {/* Name */}
      <SkeletonItem height={24} width="60%" style={{ marginBottom: 8 }} />
      
      {/* Role/Status */}
      <SkeletonItem height={16} width="40%" />
    </View>
  );
};