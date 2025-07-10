import { MainHeader } from "../../src/components/wrapper/MainHeader";
import React from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
// import { Utilities, globalStyles } from '../helpers';
// import { NavigationProps } from '../interfaces';
import { globalStyles } from "../../src/helpers";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { UserHelper } from "../../src/helpers/UserHelper";
import { OptimizedImage } from "../../src/components/OptimizedImage";

const Votd = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
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
    else if (diff9x16 < diff1x1) result = "9x16";
    setShape(result);
  };

  const getDayOfYear = () => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = now.getTime() - start.getTime();
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day;
  };

  React.useEffect(() => {
    UserHelper.addOpenScreenEvent("VOTD Screen");
    getShape();
    Dimensions.addEventListener("change", getShape);
  }, []);

  const day = getDayOfYear();
  const url = "https://votd.org/v1/" + day.toString() + "/" + shape + ".jpg";

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title="Verse of the Day" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />
      <View style={globalStyles.webViewContainer}>
        <OptimizedImage source={{ uri: url }} style={{ flex: 1 }} contentFit="fill" priority="high" />
      </View>
    </SafeAreaView>
  );
};
export default Votd;
