import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { ApiHelper, Constants, ConversationCheckInterface, EnvironmentHelper, UserHelper, UserSearchInterface } from "../../src/helpers";
import { ErrorHelper } from "../../src/mobilehelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { FlatList, Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { useAppTheme } from "../../src/theme";
import { ActivityIndicator, Button, List, Surface, Text, TextInput } from "react-native-paper";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";

const SearchMessageUser = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { theme, spacing } = useAppTheme();
  const [searchText, setSearchText] = useState("");
  const [searchList, setSearchList] = useState<UserSearchInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const currentUserChurch = useCurrentUserChurch();

  useEffect(() => {
    getPreviousConversations();
    UserHelper.addOpenScreenEvent("User Search Screen");
  }, []);

  const getPreviousConversations = () => {
    setMainLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      setMainLoading(false);
      let userIdList: string[] = [];
      if (Object.keys(data).length != 0) {
        userIdList = data.map(e => (currentUserChurch?.person?.id == e.fromPersonId ? e.toPersonId : e.fromPersonId));
        if (userIdList.length != 0) {
          ApiHelper.get("/people/basic?ids=" + userIdList.join(","), "MembershipApi").then((userData: UserSearchInterface[]) => {
            setMainLoading(false);
            for (let i = 0; i < userData.length; i++) {
              const singleUser: UserSearchInterface = userData[i];
              const tempConvo: ConversationCheckInterface | undefined = data.find(x => x.fromPersonId == singleUser.id || x.toPersonId == singleUser.id);
              userData[i].conversationId = tempConvo?.conversationId;
            }
            setSearchList(userData);
          });
        }
      }
    }).catch(() => { setMainLoading(false); });
  };

  const searchUserApiCall = useCallback((text: string) => {
    setLoading(true);
    setLastSearch(text);
    ApiHelper.get("/people/search/?term=" + text, "MembershipApi").then(data => {
      setLoading(false);
      setSearchList(data);
    });
  }, []);

  const userSelection = useCallback(async (userData: UserSearchInterface) => {
    try {
      router.navigate({
        pathname: "/messageScreenRoot",
        params: {
          userDetails: JSON.stringify(userData)
        }
      });
    } catch (err: any) {
      ErrorHelper.logError("user-selection", err);
    }
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleSearchPress = useCallback(() => {
    searchUserApiCall(searchText);
  }, [searchText, searchUserApiCall]);

  const searchSection = useMemo(
    () => (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Surface style={{ padding: spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.roundness, margin: spacing.md, elevation: 2 }}>
          <Text variant="headlineSmall" style={{ marginBottom: spacing.md }}>
            Search for a person
          </Text>
          <TextInput mode="outlined" label="Name" placeholder="Name" value={searchText} onChangeText={handleSearchChange} style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }} left={<TextInput.Icon icon="account" />} />
          <Button mode="contained" onPress={handleSearchPress} loading={loading} style={{ marginBottom: spacing.md }}>
            Search
          </Button>
        </Surface>
      </TouchableWithoutFeedback>
    ),
    [spacing.md, theme.colors.background, theme.colors.surface, theme.roundness, searchText, handleSearchChange, handleSearchPress, loading]
  );

  const displayedSearchList = useMemo(() => (searchText === "" ? (searchList.length !== 0 ? searchList : []) : searchList), [searchText, searchList]);

  return (
    <>
      <MainHeader title="Search Messages" openDrawer={() => navigation.openDrawer()} />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {mainLoading && <ActivityIndicator animating={true} size="large" style={{ marginTop: spacing.lg }} />}
        {!mainLoading && (
    <List.Section style={{ flex: 1 }}>
      {searchSection}

      <FlatList
        data={displayedSearchList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const imageUri = item.photo
            ? item.photo.startsWith("http")
              ? item.photo
              : EnvironmentHelper.ContentRoot + item.photo
            : "";

          return (
            <List.Item
              title={item.name.display}
              left={() =>
                item.photo ? (
                  <OptimizedImage
                    source={{ uri: imageUri }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: spacing.md,
                    }}
                    contentFit="cover"
                  />
                ) : (
                  <OptimizedImage
                    source={Constants.Images.ic_user}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: spacing.md,
                    }}
                    tintColor={theme.colors.primary}
                    contentFit="cover"
                  />
                )
              }
              onPress={() => userSelection(item)}
              style={{
                backgroundColor: theme.colors.surface,
                marginHorizontal: spacing.md,
                marginBottom: spacing.xs,
                borderRadius: theme.roundness,
                elevation: 1,
              }}
              titleStyle={{ fontWeight: "500" }}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: spacing.lg }}>
            {searchText !== '' && !loading && searchText === lastSearch ? 'No matches found' : null}
          </Text>
        }
      />
    </List.Section>
  )}
      </View>
    </>
  );
};
export default SearchMessageUser;
