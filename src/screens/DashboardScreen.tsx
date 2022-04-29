import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, FlatList, Image } from 'react-native';
import { LinkInterface, UserHelper } from '../helpers';
import WebView from 'react-native-webview';
import { Loader, SimpleHeader } from '../components';
import { globalStyles } from '../helpers';
import { ImageButton } from '../components/ImageButton';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { NavigationHelper } from '../helpers/NavigationHelper';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
  route: {
    params: {
      url: any,
      title: string
    }
  };
}

export const DashboardScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const { params } = props.route;
  const [isLoading, setLoading] = useState(false);

  const checkRedirect = () => {
    if (!UserHelper.currentChurch) props.navigation.navigate("ChurchSearch")
  }

  const getButton = (topItem: boolean, item: LinkInterface) => {
    let img = require("../assets/images/dash_worship.png"); //https://www.pexels.com/photo/man-raising-his-left-hand-2351722/
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
    }


    //return (<ImageButton image="https://chums.org/images/home/about-bg.jpg" text={item.text} />);
    return (<ImageButton image={img} text={item.text} onPress={() => NavigationHelper.navigateToScreen(item, navigate)} />);
  }


  const getButtons = () => {
    return <FlatList data={UserHelper.links} renderItem={({ item }) => getButton(false, item)} keyExtractor={(item: any) => item.id} />
  }

  useEffect(() => { checkRedirect(); }, [])

  const getBrand = () => {
    if (UserHelper.churchAppearance.logoLight) return <Image source={{ uri: UserHelper.churchAppearance.logoLight }} style={{ width: "100%", height: widthPercentageToDP(25) }} />
    else return <Text style={{ fontSize: 20, width: "100%", textAlign: "center", marginTop: 0 }}>{UserHelper.currentChurch.name}</Text>
  }

  return (

    <SafeAreaView style={globalStyles.homeContainer}>
      <SimpleHeader onPress={() => openDrawer()} title={"Home"} />
      <View style={globalStyles.webViewContainer}>
        {getBrand()}

        {getButtons()}
      </View>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};


