import { AppCenterHelper } from '@churchapps/mobilehelper';
import React from 'react';
import { Dimensions, Image, SafeAreaView, View } from 'react-native';
import { MainHeader } from '../components';
import { globalStyles } from '../helpers';
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps;
}

export const VotdScreen = (props: Props) => {
  const [shape, setShape] = React.useState("9x16");

  const getShape = () => {
    const dim = Dimensions.get("screen");
    const width = dim.width;
    const height = dim.height;
    const ratio = width / height;
    const diff1x1 = Math.abs(ratio - 1);
    const diff16x9 = Math.abs(ratio - 1.777);
    const diff9x16 = Math.abs(ratio - 0.5625);
    let result = "1x1";
    if (diff16x9 < diff1x1) result = "16x9";
    else if (diff9x16 < diff1x1) result = "9x16"
    setShape(result);
  }

  const getDayOfYear = () => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = now.getTime() - start.getTime();
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day;
  }

  React.useEffect(() => {
    AppCenterHelper.trackEvent("VOTD Screen");
    getShape();
    Dimensions.addEventListener("change", getShape);
  }, []);
  
   const day = getDayOfYear();
  const url = "https://votd.org/v1/" + day.toString() + "/" + shape + ".jpg";

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title="Verse of the Day" openDrawer={props.navigation.openDrawer} />
      <View style={globalStyles.webViewContainer}>
        <Image source={{ uri: url }} style={{ flex: 1 }} resizeMode="stretch" />
      </View>
    </SafeAreaView>
  );
};