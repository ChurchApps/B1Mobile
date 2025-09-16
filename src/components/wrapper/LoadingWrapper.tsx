import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Loader } from "../Loader";
import { runOnJS } from "react-native-reanimated";

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
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
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            runOnJS(() => {
              setIsLoading(false);
              setShowLoader(false);
              loadingStartTime.current = null;
            })();
          });
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
        <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
          <View style={styles.loaderCard}>
            <Loader isLoading={true} />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 249, 250, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  loaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minWidth: 80,
    alignItems: "center"
  }
});
