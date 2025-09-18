import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { UserHelper } from "../helpers";

interface NavigationOptions {
  /**
   * Fallback route if navigation history is empty
   */
  fallbackRoute?: string;
  /**
   * Whether to log analytics events
   */
  logEvent?: boolean;
}

export const useNavigation = () => {
  const router = useRouter();

  const navigateTo = useCallback(
    (screen: string, params?: Record<string, any>, options?: NavigationOptions) => {
      const { logEvent = true } = options || {};

      if (logEvent) {
        UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
      }

      if (params) {
        router.push({ pathname: screen as any, params });
      } else {
        router.push(screen as any);
      }
    },
    [router]
  );

  const navigateBack = useCallback(
    (fallbackRoute: string = "/(drawer)/dashboard") => {
      // Prevent navigating back to splash screen
      try {
        if (router.canGoBack()) {
          // Check if going back would lead to splash screen
          const state = router.routeInfo;
          // If we detect we're about to go to root/splash, go to dashboard instead
          if (state?.pathname === "/" || !state?.pathname) {
            router.replace(fallbackRoute as any);
          } else {
            router.back();
          }
        } else {
          // Use replace instead of navigate to avoid adding to history
          router.replace(fallbackRoute as any);
        }
      } catch (error) {
        // Fallback to dashboard if any error occurs
        console.warn("Navigation error, falling back to dashboard:", error);
        router.replace(fallbackRoute as any);
      }
    },
    [router]
  );

  const navigationBackNormal = useCallback(
    (fallbackRoute: string = "/(drawer)/dashboard") => {
      // Prevent navigating back to splash screen
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          // Use replace instead of navigate to avoid adding to history
          router.replace(fallbackRoute as any);
        }
      } catch (error) {
        // Fallback to dashboard if any error occurs
        console.warn("Navigation error, falling back to dashboard:", error);
        router.replace(fallbackRoute as any);
      }
    },
    [router]
  );

  const navigateReplace = useCallback(
    (screen: string, params?: Record<string, any>, options?: NavigationOptions) => {
      const { logEvent = true } = options || {};

      if (logEvent) {
        UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
      }

      if (params) {
        router.replace({ pathname: screen as any, params });
      } else {
        router.replace(screen as any);
      }
    },
    [router]
  );

  const navigateDismissAll = useCallback(
    (screen: string, params?: Record<string, any>, options?: NavigationOptions) => {
      const { logEvent = true } = options || {};

      if (logEvent) {
        UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
      }

      if (params) {
        router.dismissAll();
        router.push({ pathname: screen as any, params });
      } else {
        router.dismissAll();
        router.push(screen as any);
      }
    },
    [router]
  );

  /**
   * Consistent navigation that maintains proper stack behavior
   * Use this instead of forcing dashboard navigation
   */
  const navigateWithStack = useCallback(
    (screen: string, params?: Record<string, any>, options?: NavigationOptions) => {
      const { logEvent = true } = options || {};

      if (logEvent) {
        UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
      }

      // For main sections, use replace to avoid deep stacks
      const mainSections = ["/(drawer)/dashboard", "/(drawer)/sermons", "/(drawer)/myGroups", "/(drawer)/donation"];

      if (mainSections.includes(screen)) {
        if (params) {
          router.replace({ pathname: screen as any, params });
        } else {
          router.replace(screen as any);
        }
      } else {
        // For detail screens, use push to maintain back navigation
        if (params) {
          router.push({ pathname: screen as any, params });
        } else {
          router.push(screen as any);
        }
      }
    },
    [router]
  );

  return {
    navigateTo,
    navigateBack,
    navigateReplace,
    navigateDismissAll,
    navigateWithStack,
    router,
    navigationBackNormal
  };
};

/**
 * Hook for handling hardware back button on Android
 * Use this in screens that need custom back button behavior
 */
export const useHardwareBackHandler = (onBackPress: () => boolean) => {
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => backHandler.remove();
    }
  }, [onBackPress]);
};
