import { MainHeader } from "../../src/components/wrapper/MainHeader";
import React, { useCallback } from "react";
import { Dimensions, View, ActivityIndicator } from "react-native";
import { globalStyles } from "../../src/helpers";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useFocusEffect, useNavigation } from "expo-router";
import { UserHelper } from "../../src/helpers/UserHelper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OptimizedImage from "@/components/OptimizedImage";

const Votd = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [shape, setShape] = React.useState("9x16");
  const [loading, setLoading] = React.useState(true);

  const insets = useSafeAreaInsets();
  const navigationMain = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigationMain.setOptions({ title: "Verse of the Day" });
    }, [navigationMain])
  );

  const getShape = () => {
    const { width, height } = Dimensions.get("screen");
    const ratio = width / height;
    const diff1x1 = Math.abs(ratio - 1);
    const diff16x9 = Math.abs(ratio - 1.777);
    const diff9x16 = Math.abs(ratio - 0.5625);

    if (diff16x9 < diff1x1) setShape("16x9");
    else if (diff9x16 < diff1x1) setShape("9x16");
    else setShape("1x1");
  };

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  React.useEffect(() => {
    UserHelper.addOpenScreenEvent("VOTD Screen");
    getShape();
    Dimensions.addEventListener("change", getShape);
  }, []);

  const day = getDayOfYear();
  const url = `https://votd.org/v1/${day}/${shape}.jpg`;

  return (
    <View style={[globalStyles.homeContainer, { paddingBottom: insets.bottom }]}>
      <MainHeader title="Verse of the Day" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />

      <View style={globalStyles.webViewContainer}>
        {loading && <ActivityIndicator size="small" color="#000" style={{ position: "absolute", top: "50%", left: "50%" }} />}

        <OptimizedImage source={{ uri: url }} style={{ flex: 1 }} contentFit="fill" priority="high" onLoad={() => setLoading(false)} />
      </View>
    </View>
  );
};

export default Votd;
