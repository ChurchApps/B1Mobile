import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation as useReactNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ApiHelper } from "@churchapps/helpers";
import { useTranslation } from "react-i18next";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { useNavigation } from "../../src/hooks";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import { InlineLoader } from "../../src/components/common/LoadingComponents";
import { VolunteerBrowseList } from "../../src/components/volunteer/VolunteerBrowseList";
import { SignupPlanData } from "../../src/interfaces";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#F6F6F8",
    surface: "#FFFFFF",
    background: "#F6F6F8",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F6F6F8",
      level3: "#F0F0F0",
      level4: "#E9ECEF",
      level5: "#E2E6EA"
    }
  }
};

const VolunteerBrowse = () => {
  const { t } = useTranslation();
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack } = useNavigation();
  const currentUserChurch = useCurrentUserChurch();
  const churchId = currentUserChurch?.church?.id;

  const { data: signupPlans = [], isLoading } = useQuery<SignupPlanData[]>({
    queryKey: ["/plans/public/signup/" + churchId, "DoingApi-anon"],
    queryFn: () => ApiHelper.getAnonymous("/plans/public/signup/" + churchId, "DoingApi"),
    enabled: !!churchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <MainHeader
            title={t("volunteer.browseOpportunities")}
            openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
            back={() => navigateBack()}
          />
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <InlineLoader size="large" text={t("volunteer.loadingOpportunities")} />
              </View>
            ) : (
              <VolunteerBrowseList signupPlans={signupPlans} />
            )}
          </ScrollView>
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F8" },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  loadingContainer: { alignItems: "center", padding: 60 }
});

export default VolunteerBrowse;
