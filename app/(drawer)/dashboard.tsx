import { View, Text, SafeAreaView, FlatList, Image, Dimensions, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CacheHelper, EnvironmentHelper, globalStyles, LinkInterface, UserHelper, Utilities } from '@/src/helpers'
import { Loader, MainHeader } from '../components'
import { DimensionHelper } from '@churchapps/mobilehelper'
import { ImageButton } from '../components/ImageButton'
import { NavigationHelper } from '@/src/helpers/NavigationHelper'
import { router, useNavigation } from 'expo-router'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import { NavigationProp } from '@react-navigation/native'

const dashboard = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const nav = useNavigation<NavigationProp<any>>();

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
    [])

  const checkRedirect = () => {

    console.log("hereeee thee screen")
    if (!CacheHelper.church) router.navigate('/(drawer)/churchSearch');
    else console.log("else");
  }

  const getButton = (topItem: boolean, item: LinkInterface) => {
    if (item.linkType === "separator") return (<></>);
    let img = require("@/src/assets/images/dash_worship.png"); //https://www.pexels.com/photo/man-raising-his-left-hand-2351722/
    if (item.photo) {
      img = { uri: item.photo }
    } else {
      switch (item.linkType) {
        case "url":

          img = require('@/src/assets/images/dash_url.png'); //https://www.pexels.com/photo/selective-focus-photography-of-macbook-pro-with-turned-on-screen-on-brown-wooden-table-68763/
          break;
        case "directory":
          img = require('@/src/assets/images/dash_directory.png'); //https://www.pexels.com/photo/smiling-women-and-men-sitting-on-green-grass-1231230/
          break;
        case "checkin":
          img = require("@/src/assets/images/dash_checkin.png"); //https://www.pexels.com/photo/silver-imac-apple-magic-keyboard-and-magic-mouse-on-wooden-table-38568/
          break;
        case "donation":
          img = require("@/src/assets/images/dash_donation.png"); //https://www.pexels.com/photo/person-s-holds-brown-gift-box-842876/
          break;
        case "lessons":
          img = require("@/src/assets/images/dash_lessons.png"); //https://www.pexels.com/photo/children-sitting-on-brown-wooden-chairs-8088103/
          break;
        case "bible":
          img = require("@/src/assets/images/dash_bible.png"); //https://www.pexels.com/photo/pink-pencil-on-open-bible-page-and-pink-272337/
          break;
        case "votd":
          img = require("@/src/assets/images/dash_votd.png"); //https://www.pexels.com/photo/empty-gray-road-under-white-clouds-3041347/
          break;
        case "Plans":
          img = require("@/src/assets/images/dash_votd.png"); //https://www.pexels.com/photo/empty-gray-road-under-white-clouds-3041347/
          break;
      }
    }
    return (
      <ImageButton key={item.id} image={img} text={item.text} onPress={() => {
        NavigationHelper.navigateToScreen(item, router.navigate)
      }
      }
      />);
  }

  const getButtons = () => {
    return <FlatList data={UserHelper.links} renderItem={({ item }) => getButton(false, item)} keyExtractor={(item: any, index: number) => index.toString()} />
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

export default dashboard