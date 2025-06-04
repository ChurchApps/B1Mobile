import React from 'react';
import { Loader } from '@/src/components/Loader';
import { MainHeader } from '@/src/components/wrapper/MainHeader';
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '@/src/helpers';
import { NavigationProps } from '@/src/interfaces'; // Unused, consider removing
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
// FontAwesome5 and Zocial Icon are replaced by Paper components or mapped names
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, SafeAreaView, View, StyleSheet } from 'react-native'; // Image, Text, TouchableOpacity removed
import { FlatList, ScrollView } from 'react-native-gesture-handler'; // TouchableOpacity removed from here
import { Avatar, Button as PaperButton, Card, List, Text as PaperText, useTheme, Divider } from 'react-native-paper';

// Props interface seems unused, remove if not needed for props destructuring
// interface Props {
//   navigation: NavigationProps;
//   route: {
//     params: {
//       member: any,
//     }
//   };
// }

const MemberDetail = () => { // Removed props: Props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { member: memberString } = useLocalSearchParams<{ member: string }>(); // Ensure memberString is string

  const parsedMember = memberString ? JSON.parse(memberString) : null;
  const memberinfo = parsedMember?.contactInfo;
  const [isLoading, setLoading] = useState(false);
  const [householdList, setHouseholdList] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null); // Typed ScrollView ref

  useEffect(() => {
    if (parsedMember) { // Ensure parsedMember is not null before proceeding
      getHouseholdMembersList();
      UserHelper.addOpenScreenEvent("Member Detail Screen");
    }
  }, [parsedMember]); // Depend on parsedMember

  const onEmailClick = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
    else Alert.alert("Sorry", 'Email of this user is not available.');
  };

  const onPhoneClick = (phone: any) => {
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert("Sorry", 'Phone number of this user is not available.');
  };

  const onAddressClick = () => {
    if (memberinfo?.address1) Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${memberinfo.address1}`);
    else Alert.alert("Sorry", 'Address of this user is not available.');
  };

  const getHouseholdMembersList = async () => {
    if (!parsedMember?.householdId) return; // Guard against missing householdId
    setLoading(true);
    try {
      const data = await ApiHelper.get("/people/household/" + parsedMember.householdId, "MembershipApi");
      setHouseholdList(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onMembersClick = (item: any) => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    router.navigate({ pathname: '/(drawer)/memberDetail', params: { member: JSON.stringify(item) } });
  };

  const renderMemberItem = ({ item }: { item: any }) => { // Typed item
    const photoUri = item.photo ? EnvironmentHelper.ContentRoot + item.photo : null;
    return (
      <List.Item
        title={item.name.display}
        titleStyle={{color: theme.colors.onSurface}}
        onPress={() => onMembersClick(item)}
        left={props => photoUri
            ? <Avatar.Image {...props} source={{uri: photoUri}} size={DimensionHelper.wp(12)} style={styles.avatarSmall} />
            : <Avatar.Icon {...props} icon="account" size={DimensionHelper.wp(12)} style={styles.avatarSmall} />
        }
        style={styles.householdListItem}
      />
    );
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    scrollView: { backgroundColor: theme.colors.background },
    profileAvatar: { alignSelf: 'center', marginVertical: theme.spacing?.md || 16, backgroundColor: theme.colors.surfaceVariant },
    nameMsgContainer: { ...globalStyles.nameMsgContainer, alignItems: 'center', paddingHorizontal: theme.spacing?.md || 16, marginBottom: theme.spacing?.md || 16 },
    memberName: { ...globalStyles.memberName, color: theme.colors.onBackground, textAlign: 'center' }, // Use PaperText variant later
    messageButton: { marginTop: theme.spacing?.sm || 8, backgroundColor: theme.colors.primary },
    messageButtonLabel: { color: theme.colors.onPrimary },
    detailCard: { marginHorizontal: theme.spacing?.md || 16, marginBottom: theme.spacing?.sm || 8 },
    detailItem: { backgroundColor: theme.colors.surfaceVariant }, // For List.Item background
    detailValueText: { color: theme.colors.onSurfaceVariant }, // For text within List.Item description or title
    householdTitle: { ...globalStyles.searchMainText, alignSelf: 'center', marginVertical: theme.spacing?.md || 16, color: theme.colors.onBackground },
    listContainer: { ...globalStyles.listContainerStyle, alignSelf:'center', width:'95%' },
    avatarSmall: { backgroundColor: theme.colors.surfaceVariant },
    householdListItem: { backgroundColor: theme.colors.surface, borderRadius: theme.roundness, marginVertical: 4 }
  });

  if (!parsedMember) { // Handle case where member data might be missing
    return (
      <SafeAreaView style={styles.safeArea}>
        <MainHeader title="Directory" openDrawer={navigation.openDrawer} back={navigation.goBack} />
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <PaperText variant="headlineSmall">Member data not found.</PaperText>
        </View>
        {isLoading && <Loader isLoading={isLoading} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title="Directory" openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <ScrollView style={styles.scrollView} ref={scrollViewRef}>
        <Avatar.Image
          size={DimensionHelper.wp(30)} // Larger avatar size
          source={parsedMember.photo ? { uri: EnvironmentHelper.ContentRoot + parsedMember.photo } : Constants.Images.ic_member}
          style={styles.profileAvatar}
        />
        <View style={styles.nameMsgContainer}>
          <PaperText variant="headlineSmall" style={styles.memberName}>{parsedMember.name?.display}</PaperText>
          <PaperButton
            mode="contained"
            icon="message-outline"
            style={styles.messageButton}
            labelStyle={styles.messageButtonLabel}
            onPress={() => router.navigate({ pathname: '/(drawer)/messageScreen', params: { userDetails: JSON.stringify(parsedMember) }})}
          >
            MESSAGE
          </PaperButton>
        </View>

        <Card style={styles.detailCard}>
          <List.Item
            title={memberinfo?.email || '-'}
            titleStyle={!memberinfo?.email && styles.detailValueText}
            description="Email"
            descriptionStyle={styles.detailValueText}
            left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
            onPress={() => onEmailClick(memberinfo?.email)}
            style={styles.detailItem}
          />
          <Divider />
          <List.Item
            title={memberinfo?.homePhone || '-'}
            titleStyle={!memberinfo?.homePhone && styles.detailValueText}
            description="Phone"
            descriptionStyle={styles.detailValueText}
            left={props => <List.Icon {...props} icon="phone" color={theme.colors.primary} />}
            onPress={() => onPhoneClick(memberinfo?.homePhone)}
            style={styles.detailItem}
          />
          <Divider />
          <List.Item
            title={`${memberinfo?.address1 || ''}${memberinfo?.address1 && memberinfo?.address2 ? ', ' : ''}${memberinfo?.address2 || ''}`}
            description={`${memberinfo?.city || ''}${memberinfo?.city && memberinfo?.state ? ', ' : ''}${memberinfo?.state || ''} ${memberinfo?.zip || ''}`.trim() || '-'}
            titleStyle={!memberinfo?.address1 && styles.detailValueText}
            descriptionStyle={styles.detailValueText}
            left={props => <List.Icon {...props} icon="map-marker" color={theme.colors.primary} />}
            onPress={onAddressClick}
            style={styles.detailItem}
            numberOfLines={3}
          />
        </Card>

        <PaperText variant="titleMedium" style={styles.householdTitle}>- Household Members -</PaperText>
        <FlatList data={householdList} renderItem={renderMemberItem} keyExtractor={(item: any) => item.id.toString()} style={styles.listContainer} scrollEnabled={false} />
      </ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};

export default MemberDetail;
