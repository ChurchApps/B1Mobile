import React from "react"
import { View, Text } from "react-native"
import Ripple from "react-native-material-ripple";
import { RouteProp } from "@react-navigation/native";
import { MemberList, ChumsCachedData, VisitInterface, Styles } from "./components"
import { CheckinScreens, checkinNavigationProps } from "./CheckinScreens"

type ProfileScreenRouteProp = RouteProp<CheckinScreens, "Household">;
interface Props { navigation: checkinNavigationProps; route: ProfileScreenRouteProp; }

export const Household = (props: Props) => {
    const [pendingVisits, setPendingVisits] = React.useState<VisitInterface[]>([]);
    const init = () => { props.navigation.addListener("focus", () => { setPendingVisits([...ChumsCachedData.pendingVisits]); }); }
    const checkin = () => { props.navigation.navigate("CheckinComplete"); }
    const handleAddGuest = () => { props.navigation.navigate("AddGuest"); }

    React.useEffect(init, []);

    return (
        <>
            <View style={[Styles.blockButtons, { marginBottom: "3%" }]}>
                <Ripple style={Styles.blockButton} onPress={handleAddGuest}><Text style={Styles.blockButtonText}>ADD GUEST</Text></Ripple>
            </View>
            <MemberList navigation={props.navigation} pendingVisits={pendingVisits} />
            <View style={[Styles.blockButtons]}>
                <Ripple style={[Styles.blockButton]} onPress={checkin}><Text style={Styles.blockButtonText}>CHECKIN</Text></Ripple>
            </View>
        </>
    );
}