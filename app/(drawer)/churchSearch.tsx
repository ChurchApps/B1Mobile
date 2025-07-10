import React from "react";
import { BlueHeader } from "@/components/BlueHeader";
import { ArrayHelper, ChurchInterface, Constants, UserHelper } from "../../src/helpers";
import { ErrorHelper } from "../../src/mobilehelper";
import { ApiHelper } from "../../src/mobilehelper";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useAppTheme } from "../../src/theme";
import { ActivityIndicator, Button, List, Surface, Text, TextInput } from "react-native-paper";
import RNRestart from "react-native-restart";
import { Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { clearAllCachedData } from "../../src/helpers/QueryClient";
import { useUserStore, useRecentChurches, useUserChurches } from "../../src/stores/useUserStore";

const ChurchSearch = () => {
  const { theme, spacing } = useAppTheme();
  const [searchText, setSearchText] = useState("");
  const recentChurches = useRecentChurches();
  const userChurches = useUserChurches();
  const { addRecentChurch, selectChurch } = useUserStore();

  // Use react-query for church search - only search when text is provided
  const { data: searchList = [], isLoading: loading } = useQuery({
    queryKey: [`/churches/search/?name=${searchText}&app=B1&include=favicon_400x400`, "MembershipApi"],
    queryFn: async () => ApiHelper.getAnonymous(`/churches/search/?name=${searchText}&app=B1&include=favicon_400x400`, "MembershipApi"),
    enabled: searchText.length > 2, // Only search when user has typed at least 3 characters
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes - search results can be cached briefly
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  useEffect(() => {
    // Utilities.trackEvent("Church Search Screen");
    UserHelper.addOpenScreenEvent("Church Search Screen");
  }, []);

  const churchSelection = async (churchData: ChurchInterface) => {
    try {
      // Check if user is already a member of this church
      let existing = userChurches.find(uc => uc.church.id === churchData.id);
      if (existing) {
        churchData = existing.church;
      }

      // Add to recent churches
      addRecentChurch(churchData);

      // Clear all cached data when switching churches
      await clearAllCachedData();

      // Use the store to select the church
      await selectChurch(churchData);

      UserHelper.addAnalyticsEvent("church_selected", {
        id: Date.now(),
        device: Platform.OS,
        church: churchData.name
      });

      router.navigate("/(drawer)/dashboard");

      if (Platform.OS === "android") {
        RNRestart.Restart();
      }
    } catch (err: any) {
      console.error("❌ Church selection error:", err);
      ErrorHelper.logError("church-search", err);
    }
  };

  // Remove GetRecentList - no longer needed with hooks

  // Remove StoreToRecent - handled by the store now

  const getHeaderView = () => (
    <View>
      <BlueHeader />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Surface style={{ padding: spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.roundness, margin: spacing.md, elevation: 2 }}>
          <Text variant="headlineSmall" style={{ marginBottom: spacing.md }}>
            Find Your Church
          </Text>
          <TextInput mode="outlined" label="Church name" placeholder="Church name" value={searchText} onChangeText={setSearchText} style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }} left={<TextInput.Icon icon="church" />} />
          <Button mode="contained" onPress={() => {}} loading={loading} style={{ marginBottom: spacing.md }}>
            Search
          </Button>
          {searchText === "" && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }}>
              {recentChurches.length === 0 ? "No recent churches available." : "Recent Churches"}
            </Text>
          )}
        </Surface>
      </TouchableWithoutFeedback>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading && <ActivityIndicator animating={true} size="large" style={{ marginTop: spacing.lg }} />}
      <List.Section>
        {getHeaderView()}
        {(searchText === "" ? recentChurches.slice().reverse() : searchList).map((item: any, index: any) => (
          <List.Item
            key={item.id || index}
            title={item.name}
            left={() => (
              <OptimizedImage
                source={(() => {
                  let churchImage = Constants.Images.ic_church;
                  if (item.settings && item.settings.length > 0) {
                    let setting = ArrayHelper.getOne(item.settings, "keyName", "favicon_400x400");
                    if (!setting) setting = item.settings[0];
                    churchImage = { uri: setting.value };
                  }
                  return churchImage;
                })()}
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: spacing.md }}
                placeholder={Constants.Images.ic_church}
              />
            )}
            onPress={() => churchSelection(item)}
            style={{ backgroundColor: theme.colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.xs, borderRadius: theme.roundness, elevation: 1 }}
            titleStyle={{ fontWeight: "500" }}
          />
        ))}
      </List.Section>
    </View>
  );
};

export default ChurchSearch;
