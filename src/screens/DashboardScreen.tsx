import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, Text, View } from 'react-native';
import { widthPercentageToDP, } from 'react-native-responsive-screen';
import { Loader, MainHeader } from '../components';
import { ImageButton } from '../components/ImageButton';
import { LinkInterface, UserHelper, Utilities, globalStyles } from '../helpers';
import { NavigationHelper } from '../helpers/NavigationHelper';

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const DashboardScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
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
    if (!UserHelper.currentUserChurch) props.navigation.navigate("ChurchSearch", {})
    else Utilities.trackEvent("Dashboard Screen");
  }

  const getButton = (topItem: boolean, item: LinkInterface) => {
    let img = require("../assets/images/dash_worship.png"); //https://www.pexels.com/photo/man-raising-his-left-hand-2351722/
    if (item.photo) {
      img = { uri: item.photo }
    } else {
      switch (item.linkType) {
        case "url":
          img = require("../assets/images/dash_url.png"); //https://www.pexels.com/photo/selective-focus-photography-of-macbook-pro-with-turned-on-screen-on-brown-wooden-table-68763/
          break;
        case "directory":
          img = require("../assets/images/dash_directory.png"); //https://www.pexels.com/photo/smiling-women-and-men-sitting-on-green-grass-1231230/
          break;
        case "checkin":
          img = require("../assets/images/dash_checkin.png"); //https://www.pexels.com/photo/silver-imac-apple-magic-keyboard-and-magic-mouse-on-wooden-table-38568/
          break;
        case "donation":
          img = require("../assets/images/dash_donation.png"); //https://www.pexels.com/photo/person-s-holds-brown-gift-box-842876/
          break;
        case "lessons":
          img = require("../assets/images/dash_lessons.png"); //https://www.pexels.com/photo/children-sitting-on-brown-wooden-chairs-8088103/
          break;
        case "bible":
          img = require("../assets/images/dash_bible.png"); //https://www.pexels.com/photo/pink-pencil-on-open-bible-page-and-pink-272337/
          break;
        case "votd":
          img = require("../assets/images/dash_votd.png"); //https://www.pexels.com/photo/empty-gray-road-under-white-clouds-3041347/
          break;
      }
    }
    return (<ImageButton image={img} text={item.text} onPress={() => NavigationHelper.navigateToScreen(item, navigate)} />);
  }

  const getButtons = () => {
    return <FlatList data={UserHelper.links} renderItem={({ item }) => getButton(false, item)} keyExtractor={(item: any) => item.id} />
  }

  const getBrand = () => {
    if (UserHelper.churchAppearance?.logoLight) return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={{ width: "100%", height: widthPercentageToDP(25) }} />
    else return <Text style={{ fontSize: 20, width: "100%", textAlign: "center", marginTop: 0 }}>{UserHelper.currentUserChurch?.church?.name}</Text>
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer} >
      <MainHeader title="Home" openDrawer={props.navigation.openDrawer} />
      <View style={globalStyles.webViewContainer}>
        {getBrand()}
        {getButtons()}
      </View>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};


