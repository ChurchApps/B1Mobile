import React from "react";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper } from "@/src/helpers";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAppTheme } from "@/src/theme";
import { ActivityIndicator, Button, Card, Surface, Text, TextInput } from "react-native-paper";

const MembersSearch = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { theme, spacing } = useAppTheme();
  const [searchText, setSearchText] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    // Utilities.trackEvent("Member Search Screen");
    loadMembers();
    UserHelper.addOpenScreenEvent("Member Search Screen");
  }, []);

  const loadMembers = () => {
    setLoading(true);
    ApiHelper.get("/people", "MembershipApi").then(data => {
      setLoading(false);
      setSearchList(data);
      setMembersList(data);
      if (data.length === 0) Alert.alert("Alert", "No matches found");
    });
  };

  const filterMember = (searchText: string) => {
    let filterList = membersList.filter((item: any) => {
      if (item.name.display.toLowerCase().match(searchText.toLowerCase())) {
        return item;
      }
    });
    if (searchText != "") setSearchList(filterList);
    else setSearchList(membersList);
  };

  const renderMemberItem = (item: any) => (
    <Card
      style={{ marginBottom: spacing.sm, borderRadius: theme.roundness, backgroundColor: theme.colors.surface, width: "100%", alignSelf: "center", maxWidth: 700 }}
      onPress={() => {
        router.navigate({
          pathname: "/(drawer)/memberDetail",
          params: { member: JSON.stringify(item) }
        });
      }}>
      <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={{ width: 48, height: 48, borderRadius: 24, marginRight: spacing.md }} />
        <Text variant="titleMedium">{item.name.display}</Text>
      </Card.Content>
    </Card>
  );

  const getResults = () => {
    if (isLoading) return <ActivityIndicator animating={true} size="large" style={{ margin: spacing.md }} />;
    else if (searchList.length == 0)
      return (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, margin: spacing.md }}>
          No results found
        </Text>
      );
    else
      return (
        <FlatList
          data={searchList}
          renderItem={({ item }) => renderMemberItem(item)}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ width: "100%", maxWidth: 700, alignSelf: "center" }}
        />
      );
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
      <MainHeader title="Directory" openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.md }}>
        <View style={{ width: "100%", maxWidth: 500, alignSelf: "center" }}>
          <Text variant="headlineSmall" style={{ marginBottom: spacing.md }}>
            Find Members
          </Text>
          <TextInput
            mode="outlined"
            label="Member Name"
            placeholder="Member Name"
            value={searchText}
            onChangeText={setSearchText}
            style={{ marginBottom: spacing.md, backgroundColor: theme.colors.surface, width: "100%" }}
            left={<TextInput.Icon icon="account" />}
          />
          <Button mode="contained" onPress={() => filterMember(searchText)} style={{ marginBottom: spacing.md, width: "100%" }}>
            Search
          </Button>
        </View>
        {getResults()}
      </View>
    </Surface>
  );
};
export default MembersSearch;
