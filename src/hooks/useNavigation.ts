import { useRouter } from "expo-router";
import { useCallback } from "react";
import { UserHelper } from "../helpers";

export const useNavigation = () => {
  const router = useRouter();

  const navigateTo = useCallback((screen: string, params?: Record<string, any>) => {
    UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
    
    if (params) {
      router.push({ pathname: screen as any, params });
    } else {
      router.push(screen as any);
    }
  }, [router]);

  const navigateBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [router]);

  const navigateReplace = useCallback((screen: string, params?: Record<string, any>) => {
    UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
    
    if (params) {
      router.replace({ pathname: screen as any, params });
    } else {
      router.replace(screen as any);
    }
  }, [router]);

  const navigateDismissAll = useCallback((screen: string, params?: Record<string, any>) => {
    UserHelper.logEvent(screen.replace(/[^a-zA-Z0-9]/g, "_"));
    
    if (params) {
      router.dismissAll();
      router.push({ pathname: screen as any, params });
    } else {
      router.dismissAll();
      router.push(screen as any);
    }
  }, [router]);

  return {
    navigateTo,
    navigateBack,
    navigateReplace,
    navigateDismissAll,
    router
  };
};