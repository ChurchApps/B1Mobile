import { Dimensions } from "react-native";

export class DimensionHelper {
  static wp(percentage: number): number {
    const screenWidth = Dimensions.get("window").width;
    return (percentage * screenWidth) / 100;
  }

  static hp(percentage: number): number {
    const screenHeight = Dimensions.get("window").height;
    return (percentage * screenHeight) / 100;
  }
}
