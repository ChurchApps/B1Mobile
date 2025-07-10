import { Dimensions } from "react-native";

export class StyleConstants {
  static deviceWidth = Dimensions.get("window").width;
  static deviceHeight = Dimensions.get("window").height;

  static fontSize = (StyleConstants.deviceWidth * 4) / 100;
  static fontSize1 = (StyleConstants.deviceWidth * 4.5) / 100;
  static fontSize2 = (StyleConstants.deviceWidth * 5) / 100;
  static smallFont = (StyleConstants.deviceWidth * 3.6) / 100;
  static smallerFont = (StyleConstants.deviceWidth * 3.0) / 100;

  //Colors
  static baseColor = "#24B8FE";
  static baseColor1 = "#08A1CD";
  static blueColor = "#2196F3";
  static darkColor = "#3c3c3c";
  static blackColor = "black";
  static grayColor = "gray";
  static lightGrayColor = "lightgray";
  static whiteColor = "white";
  static yellowColor = "#FEAA24";
  static greenColor = "#70DC87";
  static redColor = "#B0120C";
  static cyanColor = "#1C9BA0";
  static darkPink = "#FF69B4";
  static ghostWhite = "#F6F6F8";

  //Font
  static RobotoBold = "Roboto-Bold";
  static RobotoBlack = "Roboto-Black";
  static RobotoItalic = "Roboto-Italic";
  static RobotoLight = "Roboto-Light";
  static RobotoMedium = "Roboto-Medium";
  static RobotoRegular = "Roboto-Regular";
  static RobotoThin = "Roboto-Thin";
}
