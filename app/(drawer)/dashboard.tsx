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
import { Dimensions, FlatList, Image, SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { LinearGradient } from 'expo-linear-gradient';

const Dashboard = (props: any) => {
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
    let backgroundImage = undefined;

    // Use the link's photo if available
    if (item.photo) {
      backgroundImage = { uri: item.photo };
    } else {
      // Fall back to default images based on link type
      switch (item.linkType.toLowerCase()) {
        case "groups":
          backgroundImage = require('@/src/assets/images/dash_worship.png');
          break;
        case "checkin":
          backgroundImage = require('@/src/assets/images/dash_checkin.png');
          break;
        case "donation":
          backgroundImage = require('@/src/assets/images/dash_donation.png');
          break;
        case "directory":
          backgroundImage = require('@/src/assets/images/dash_directory.png');
          break;
        case "plans":
          backgroundImage = require('@/src/assets/images/dash_votd.png');
          break;
        case "chums":
          backgroundImage = require('@/src/assets/images/dash_url.png');
          break;
        default:
          backgroundImage = require('@/src/assets/images/dash_url.png');
          break;
      }
    }

    return (
      <ImageButton key={item.id} text={item.text} onPress={() => {
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
      <View style={{ marginTop: 16, paddingHorizontal: 12 }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', marginBottom: 12, justifyContent: 'space-between' }}>
            {row.map((item, colIndex) => (
              <View key={item.id || colIndex} style={{ flex: 0, width: '48%' }}>
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
    <LoadingWrapper loading={isLoading}>
      <LinearGradient
        colors={['#F8F9FA', '#F0F2F5']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: '100%' }]}>
          <MainHeader title="Home" openDrawer={() => {
            navigation.openDrawer()
          }} />
          <ScrollView style={globalStyles.webViewContainer} contentContainerStyle={{ flexGrow: 1 }}>
            {getBrand()}
            {getButtons()}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </LoadingWrapper>
  )
}


const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  }
});

export default Dashboard
