import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Loader } from '../Loader';
import { globalStyles } from '@/src/helpers';

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show loading in ms
  loadingThreshold?: number; // Only show loading if it takes longer than this
}

export const LoadingWrapper: React.FC<Props> = ({
  children,
  loading = false,
  initialLoading = true,
  minLoadingTime = 300, // Default minimum loading time
  loadingThreshold = 100 // Default threshold before showing loader
}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [showLoader, setShowLoader] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);
  const thresholdTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Handle initial loading
    if (initialLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [initialLoading, minLoadingTime]);

  useEffect(() => {
    // Clear any existing timeouts
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    if (thresholdTimeout.current) clearTimeout(thresholdTimeout.current);

    if (loading) {
      // Start timing the loading
      loadingStartTime.current = Date.now();

      // Set a threshold timeout - only show loader if loading takes longer than threshold
      thresholdTimeout.current = setTimeout(() => {
        setShowLoader(true);
      }, loadingThreshold);

      // Set minimum loading time
      loadingTimeout.current = setTimeout(() => {
        setIsLoading(false);
        setShowLoader(false);
        loadingStartTime.current = null;
      }, minLoadingTime);
    } else {
      // If loading finished before threshold, clear the threshold timeout
      if (thresholdTimeout.current) {
        clearTimeout(thresholdTimeout.current);
        thresholdTimeout.current = null;
      }

      // If we're showing the loader, ensure it shows for at least minLoadingTime
      if (showLoader && loadingStartTime.current) {
        const elapsedTime = Date.now() - loadingStartTime.current;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        loadingTimeout.current = setTimeout(() => {
          setIsLoading(false);
          setShowLoader(false);
          loadingStartTime.current = null;
        }, remainingTime);
      } else {
        // If we never showed the loader, just update state immediately
        setIsLoading(false);
        setShowLoader(false);
        loadingStartTime.current = null;
      }
    }

    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
      if (thresholdTimeout.current) clearTimeout(thresholdTimeout.current);
    };
  }, [loading, minLoadingTime, loadingThreshold, showLoader]);

  return (
    <View style={styles.container}>
      {children}
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          <Loader isLoading={true} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
}); 