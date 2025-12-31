import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router } from "expo-router";
import { MainHeader } from "./wrapper/MainHeader";
import { globalStyles } from "../helpers";
import { useTranslation } from "react-i18next";
// import { BibleReaderView } from "@youversion/platform-react-native";

const apiKey = "kcjG9986IOT5ThXvd3lJT1DArk9RBlYt6gzAVNA8Lnb9a8Ld";

export function BiblePageYouVersion() {
  const { t } = useTranslation();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={globalStyles.homeContainer}>
      <MainHeader
        title={t("bible.bible")}
        openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
        back={() => router.back()}
      />
      <View style={styles.container}>
        {/* <BibleReaderView appKey={apiKey} colorScheme="light" /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
