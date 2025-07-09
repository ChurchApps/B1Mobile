import React from "react";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { Constants, EnvironmentHelper, UserHelper } from "../../src/helpers";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, Linking, ScrollView, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAppTheme } from "../../src/theme";
import { ActivityIndicator, Button, Card, Surface, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { OptimizedImage } from "../../src/components/OptimizedImage";

const MemberDetail = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { theme, spacing } = useAppTheme();
  const { member } = useLocalSearchParams<{ member: any }>();
  const parsedMember = JSON.parse(member);
  const memberinfo = parsedMember?.contactInfo;
  const scrollViewRef = useRef<any>(null);

  // Use react-query for household members
  const { data: householdList = [], isLoading } = useQuery({
    queryKey: [`/people/household/${parsedMember?.householdId}`, "MembershipApi"],
    enabled: !!parsedMember?.householdId && !!UserHelper.user?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - household members don't change frequently
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Member Detail Screen");
  }, []);

  const onEmailClick = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
    else Alert.alert("Sorry", "Email of this user is not available.");
  };

  const onPhoneClick = (phone: any) => {
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert("Sorry", "Phone number of this user is not available.");
  };
  const onAddressClick = () => {
    if (memberinfo.address1) Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${memberinfo.address1}`);
    else Alert.alert("Sorry", "Address of this user is not available.");
  };

  const onMembersClick = (item: any) => {
    scrollViewRef.current.scrollTo({ y: 0, animated: false });
    router.navigate({
      pathname: "/(drawer)/memberDetail",
      params: { member: JSON.stringify(item) }
    });
  };

  const renderMemberItem = (item: any) => (
    <Card style={{ marginBottom: spacing.sm, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }} onPress={() => onMembersClick(item)}>
      <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
        <OptimizedImage source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={{ width: 48, height: 48, borderRadius: 24, marginRight: spacing.md }} placeholder={Constants.Images.ic_member} />
        <Text variant="titleMedium" numberOfLines={1}>
          {item.name.display}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
      <MainHeader title="Directory" openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <ScrollView style={{ flex: 1 }} ref={scrollViewRef} contentContainerStyle={{ padding: spacing.md }}>
        <OptimizedImage source={parsedMember?.photo ? { uri: EnvironmentHelper.ContentRoot + parsedMember?.photo } : Constants.Images.ic_member} style={{ width: 96, height: 96, borderRadius: 48, alignSelf: "center", marginBottom: spacing.md }} placeholder={Constants.Images.ic_member} priority="high" />
        <Surface style={{ alignItems: "center", marginBottom: spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.roundness, elevation: 2, padding: spacing.md }}>
          <Text variant="titleLarge" style={{ fontWeight: "600", marginBottom: spacing.sm }}>
            {parsedMember?.name?.display}
          </Text>
          <Button mode="contained" icon="message" onPress={() => router.navigate({ pathname: "/(drawer)/messageScreen", params: { userDetails: JSON.stringify(parsedMember) } })} style={{ marginBottom: spacing.sm }}>
            Message
          </Button>
        </Surface>
        <Card style={{ marginBottom: spacing.sm, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }} onPress={() => onEmailClick(memberinfo.email)}>
          <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name={"email"} color={theme.colors.primary} size={24} style={{ marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                Email:
              </Text>
              <Text variant="bodyMedium">{memberinfo.email ? memberinfo.email : "-"}</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: spacing.sm, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }} onPress={() => onPhoneClick(memberinfo.homePhone)}>
          <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome5 name={"phone"} color={theme.colors.primary} size={24} style={{ marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                Phone:
              </Text>
              <Text variant="bodyMedium">{memberinfo.homePhone ? memberinfo.homePhone : "-"}</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: spacing.sm, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }} onPress={onAddressClick}>
          <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome5 name={"location-arrow"} color={theme.colors.primary} size={24} style={{ marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                Address:
              </Text>
              {memberinfo.address1 ? <Text variant="bodyMedium">{memberinfo.address1}</Text> : null}
              {memberinfo.address2 ? <Text variant="bodyMedium">{memberinfo.address2}</Text> : null}
              <Text variant="bodyMedium">
                {memberinfo.city ? memberinfo.city + "," : ""} {memberinfo.state ? memberinfo.state + "-" : ""} {memberinfo.zip}
              </Text>
            </View>
          </Card.Content>
        </Card>
        <Text variant="titleSmall" style={{ alignSelf: "center", marginVertical: spacing.md }}>
          - Household Members -
        </Text>
        <FlatList data={householdList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} scrollEnabled={false} />
      </ScrollView>
      {isLoading && <ActivityIndicator animating={true} size="large" style={{ margin: spacing.md }} />}
    </Surface>
  );
};

export default MemberDetail;
