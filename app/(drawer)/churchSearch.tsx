import React from "react";
import { BlueHeader } from "@/components/BlueHeader";
import { ArrayHelper, CacheHelper, ChurchInterface, Constants, UserHelper } from "../../src/helpers";
import { ErrorHelper } from "../../src/helpers/ErrorHelper";
import { ApiHelper } from "../../src/mobilehelper";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useAppTheme } from "../../src/theme";
import { ActivityIndicator, Button, List, Surface, Text, TextInput } from "react-native-paper";
import RNRestart from "react-native-restart";
import { Platform } from "react-native";
import { OptimizedImage } from "../../src/components/OptimizedImage";

const ChurchSearch = () => {
  const { theme, spacing } = useAppTheme();
  const [searchText, setSearchText] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentList, setRecentList] = useState<ChurchInterface[]>([]);
  const [recentListEmpty, setRecentListEmpty] = useState(false);

  useEffect(() => {
    // Utilities.trackEvent("Church Search Screen");
    GetRecentList();
    UserHelper.addOpenScreenEvent("Church Search Screen");
  }, []);

  const churchSelection = async (churchData: ChurchInterface) => {
    StoreToRecent(churchData);
    try {
      let existing: any = null;
      try {
        if (UserHelper.churches) existing = ArrayHelper.getOne(UserHelper.churches, "church.id", churchData.id);
      } catch (e: any) {
        ErrorHelper.logError("store-recent-church", e);
      }
      if (existing) churchData = existing.church;
      await CacheHelper.setValue("church", churchData);
      UserHelper.addAnalyticsEvent("church_selected", {
        id: Date.now(),
        device: Platform.OS,
        church: churchData.name
      });
      //await UserHelper.setCurrentUserChurch(userChurch);
      if (UserHelper.user) UserHelper.setPersonRecord();
      router.navigate("/(drawer)/dashboard");
      // DevSettings.reload()
      // RNRestart.Restart();

      if (Platform.OS === "android") {
        RNRestart.Restart();
      } else {
        // router.navigate("/(drawer)/dashboard");
      }
    } catch (err: any) {
      ErrorHelper.logError("church-search", err);
    }
  };

  const searchApiCall = async (text: String) => {
    setLoading(true);
    try {
      const data = await ApiHelper.getAnonymous("/churches/search/?name=" + text + "&app=B1&include=favicon_400x400", "MembershipApi");
      setSearchList(data);
    } catch {
      setLoading(false);
    }
    setLoading(false);
  };

  const GetRecentList = async () => {
    try {
      const list = CacheHelper.recentChurches;
      if (list.length === 0) setRecentListEmpty(true);
      else {
        let reverseList = list.reverse();
        setRecentList(reverseList);
      }
    } catch (err: any) {
      console.log("GET RECENT CHURCHES ERROR", err);
      ErrorHelper.logError("get-recent-church", err);
    }
  };

  const StoreToRecent = async (churchData: any) => {
    let filteredItems: any[] = [];
    filteredItems = recentList.filter((item: any) => item.id !== churchData.id);
    filteredItems.push(churchData);
    try {
      await CacheHelper.setValue("recentChurches", filteredItems);
    } catch (err: any) {
      console.log("SET RECENT CHURCHES ERROR", err);
      ErrorHelper.logError("store-recent-church", err);
    }
  };

  const getHeaderView = () => (
    <View>
      <BlueHeader />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Surface style={{ padding: spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.roundness, margin: spacing.md, elevation: 2 }}>
          <Text variant="headlineSmall" style={{ marginBottom: spacing.md }}>
            Find Your Church
          </Text>
          <TextInput mode="outlined" label="Church name" placeholder="Church name" value={searchText} onChangeText={setSearchText} style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }} left={<TextInput.Icon icon="church" />} />
          <Button mode="contained" onPress={() => searchApiCall(searchText)} loading={loading} style={{ marginBottom: spacing.md }}>
            Search
          </Button>
          {searchText === "" && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }}>
              {recentListEmpty ? "No recent churches available." : "Recent Churches"}
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
        {(searchText === "" ? recentList : searchList).map((item: any, index: any) => (
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
