import React from 'react';
import { View, SafeAreaView, Image, useWindowDimensions, Dimensions } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { SimpleHeader } from '../components';
import { globalStyles } from '../helpers';

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

export const VotdScreen = (props: Props) => {
  const { openDrawer } = props.navigation;
  const [shape, setShape] = React.useState("9x16");

  const getShape = () => {
    const width = widthPercentageToDP(100);
    const height = heightPercentageToDP(100);
    const ratio = width / height;
    const diff1x1 = Math.abs(ratio - 1);
    const diff16x9 = Math.abs(ratio - 1.777);
    const diff9x16 = Math.abs(ratio - 0.5625);
    let result = "1x1";
    if (diff16x9 < diff1x1) result = "16x9";
    else if (diff9x16 < diff1x1) result = "9x16"
    setShape(result);
    //return result;
  }

  const getDayOfYear = () => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = now.getTime() - start.getTime();
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day;
  }

  Dimensions.addEventListener("change", getShape)
  React.useEffect(getShape, []);

  const day = getDayOfYear();
  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <SimpleHeader onPress={() => openDrawer()} title="Verse of the Day" />
      <View style={globalStyles.webViewContainer}>
        <Image source={{ uri: "https://livechurchsolutions.github.io/VotdContent/v1/" + day + "/" + shape + ".jpg" }} style={{ flex: 1 }} resizeMode="stretch" />
      </View>
    </SafeAreaView>
  );
};