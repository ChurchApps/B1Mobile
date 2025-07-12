import { StyleSheet } from "react-native";
import { Constants } from "../helpers";

export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },

  containerWithPadding: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16
  },

  // Card styles
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  // Text styles

  // Row layouts
  row: {
    flexDirection: "row",
    alignItems: "center"
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
