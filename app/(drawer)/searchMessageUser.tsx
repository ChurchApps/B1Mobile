import React from "react";
import { BlueHeader } from "@/src/components/BlueHeader";
import { ApiHelper, Constants, ConversationCheckInterface, UserHelper, UserSearchInterface } from "@/src/helpers";
import { ErrorHelper } from "@/src/helpers/ErrorHelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, TouchableWithoutFeedback, View, Image } from "react-native";
import { useAppTheme } from "@/src/theme";
import { ActivityIndicator, Button, List, Surface, Text, TextInput } from "react-native-paper";

const SearchMessageUser = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { theme, spacing } = useAppTheme();
  const [searchText, setSearchText] = useState("");
  const [searchList, setSearchList] = useState<UserSearchInterface[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPreviousConversations();
    UserHelper.addOpenScreenEvent("User Search Screen");
  }, []);

  const getPreviousConversations = () => {
    setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      setLoading(false);
      let userIdList: string[] = [];
      if (Object.keys(data).length != 0) {
        userIdList = data.map(e => (UserHelper.currentUserChurch.person.id == e.fromPersonId ? e.toPersonId : e.fromPersonId));
        if (userIdList.length != 0) {
          ApiHelper.get("/people/basic?ids=" + userIdList.join(","), "MembershipApi").then((userData: UserSearchInterface[]) => {
            setLoading(false);
            for (let i = 0; i < userData.length; i++) {
              const singleUser: UserSearchInterface = userData[i];
              const tempConvo: ConversationCheckInterface | undefined = data.find(x => x.fromPersonId == singleUser.id || x.toPersonId == singleUser.id);
              userData[i].conversationId = tempConvo?.conversationId;
            }
            setSearchList(userData);
          });
        }
      }
    });
  };

  const searchUserApiCall = (text: String) => {
    setLoading(true);
    ApiHelper.get("/people/search/?term=" + text, "MembershipApi").then(data => {
      setLoading(false);
      setSearchList(data);
      if (data.length === 0) alert("No matches found");
    });
  };

  const userSelection = async (userData: UserSearchInterface) => {
    try {
      router.navigate({
        pathname: "/messageScreen",
        params: {
          userDetails: JSON.stringify(userData)
        }
      });
    } catch (err: any) {
      ErrorHelper.logError("user-selection", err);
    }
  };

  const getHeaderView = () => (
    <View>
      <BlueHeader navigation={navigation} showMenu={true} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Surface style={{ padding: spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.roundness, margin: spacing.md, elevation: 2 }}>
          <Text variant="headlineSmall" style={{ marginBottom: spacing.md }}>
            Search for a person
          </Text>
          <TextInput
            mode="outlined"
            label="Name"
            placeholder="Name"
            value={searchText}
            onChangeText={setSearchText}
            style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface }}
            left={<TextInput.Icon icon="account" />}
          />
          <Button mode="contained" onPress={() => searchUserApiCall(searchText)} loading={loading} style={{ marginBottom: spacing.md }}>
            Search
          </Button>
        </Surface>
      </TouchableWithoutFeedback>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading && <ActivityIndicator animating={true} size="large" style={{ marginTop: spacing.lg }} />}
      <List.Section>
        {getHeaderView()}
        {(searchText === "" ? (searchList.length !== 0 ? searchList : []) : searchList).map((item: UserSearchInterface) => (
          <List.Item
            key={item.id}
            title={item.name.display}
            left={() =>
              item.photo ? (
                <Image source={{ uri: item.photo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: spacing.md }} />
              ) : (
                <Image source={Constants.Images.ic_user} style={{ width: 40, height: 40, borderRadius: 20, marginRight: spacing.md, tintColor: theme.colors.primary }} />
              )
            }
            onPress={() => userSelection(item)}
            style={{ backgroundColor: theme.colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.xs, borderRadius: theme.roundness, elevation: 1 }}
            titleStyle={{ fontWeight: "500" }}
          />
        ))}
      </List.Section>
    </View>
  );
};
export default SearchMessageUser;
