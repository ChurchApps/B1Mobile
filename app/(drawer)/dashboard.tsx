import React from 'react';
import { ImageButton } from '@/src/components/ImageButton';
import { Loader } from '@/src/components/Loader';
import { MainHeader } from '@/src/components/wrapper/MainHeader';
import { CacheHelper, LinkInterface, UserHelper, globalStyles } from '@/src/helpers';
import { NavigationHelper } from '@/src/helpers/NavigationHelper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Dashboard = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const nav = useNavigation<NavigationProp<any>>();
  const focused = useIsFocused()

  const [isLoading, setLoading] = useState(false);
  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  useEffect(() => {
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
    UserHelper.addOpenScreenEvent('Dashboard');
  }, [])

  useEffect(() => {
  }, [dimension])




  useEffect(() => {
    checkRedirect();
  },
    [focused])

  const checkRedirect = () => {
    if (!CacheHelper.church) {
      router.navigate('/(drawer)/churchSearch')
      // router.navigate('/churchSearch')
    }
  }

  const brandColor = '#175ec1';
  const getButton = (topItem: boolean, item: LinkInterface) => {
    if (item.linkType === "separator") return (<></>);
    let icon = null;
    let backgroundImage = undefined;
    switch (item.linkType.toLowerCase()) {
      case "groups":
        icon = <MaterialCommunityIcons name="account-group" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_worship.png');
        break;
      case "checkin":
        icon = <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_checkin.png');
        break;
      case "donation":
        icon = <MaterialCommunityIcons name="gift-outline" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_donation.png');
        break;
      case "directory":
        icon = <MaterialCommunityIcons name="card-account-details-outline" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_directory.png');
        break;
      case "plans":
        icon = <MaterialCommunityIcons name="calendar-month-outline" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_votd.png');
        break;
      case "chums":
        icon = <MaterialCommunityIcons name="laptop" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_url.png');
        break;
      default:
        icon = <MaterialCommunityIcons name="link-variant" size={DimensionHelper.wp(10)} color={brandColor} />;
        backgroundImage = require('@/src/assets/images/dash_url.png');
        break;
    }
    return (
      <ImageButton key={item.id} icon={icon} text={item.text} onPress={() => {
        NavigationHelper.navigateToScreen(item, router.navigate)
      }} color={brandColor} backgroundImage={backgroundImage} />
    );
  }

  const getButtons = () => {
    if (!Array.isArray(UserHelper.links)) return null;
    const items = UserHelper.links.filter(item => item.linkType !== 'separator');
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }
    return (
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', marginBottom: 16 }}>
            {row.map((item, colIndex) => (
              <View key={item.id || colIndex} style={{ flex: 1, alignItems: "center" }}>
                {getButton(false, item)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  const getBrand = () => {
    if (UserHelper.churchAppearance?.logoLight) return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={{ width: "100%", height: DimensionHelper.wp(25) }} />
    else return <Text style={{ fontSize: 20, width: "100%", textAlign: "center", marginTop: 0 }}>{CacheHelper.church?.name || ""}</Text>
  }
  return (
    <SafeAreaView style={globalStyles.homeContainer} >
      <MainHeader title="Home" openDrawer={() => {
        navigation.openDrawer()
      }} />
      <View style={globalStyles.webViewContainer}>
        {getBrand()}
        {getButtons()}
      </View>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  )
}

export default Dashboard
