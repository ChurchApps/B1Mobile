import { Constants, globalStyles } from "@/src/helpers";
import { Image, View } from "react-native";
import { MainHeader } from "./wrapper/MainHeader";

interface Props {
  onPress: () => void;
  title?: string;
}

export function WhiteHeader(props: Props) {
  //TODO: Pull in churches logo
  const logoSrc = Constants.Images.logoBlue;

  return (
    <View>
      <MainHeader title={props.title || ""} hideBell={true} />
      <View style={logoSrc}>
        <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
      </View>
    </View>
  );
}
