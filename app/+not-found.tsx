import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { useTranslation } from "react-i18next";

function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t("common.oops") }} />
      <View style={styles.container}>
        <Text>{t("common.screenDoesNotExist")}</Text>
        <Link href="/" style={styles.link}>
          <Text>{t("common.goToHomeScreen")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  }
});
export default NotFoundScreen;
