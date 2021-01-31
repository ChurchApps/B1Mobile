import React from "react"
import { drawerNavigationProps } from "./DrawerScreens";
import { Header } from "../components";
import { CheckinStackNav } from "./checkin/CheckinScreens";
import { AddGuest, CheckinComplete, Household, SelectGroup, Services, SelectPerson } from "./checkin";
import { LogoHeader } from "./checkin/components"
import { Container } from "native-base";

interface Props { navigation: drawerNavigationProps }

export const CheckinContainer = (props: Props) => {
    return (
        <>
            <Header title="Checkin" navigation={props.navigation} />
            <LogoHeader />
            <Container>
                <CheckinStackNav.Navigator screenOptions={{ headerShown: false, animationEnabled: false }} >
                    <CheckinStackNav.Screen name="SelectPerson" component={SelectPerson} />
                    <CheckinStackNav.Screen name="Services" component={Services} />
                    <CheckinStackNav.Screen name="Household" component={Household} />
                    <CheckinStackNav.Screen name="AddGuest" component={AddGuest} />
                    <CheckinStackNav.Screen name="CheckinComplete" component={CheckinComplete} />
                    <CheckinStackNav.Screen name="SelectGroup" component={SelectGroup} />
                </CheckinStackNav.Navigator>
            </Container>
        </>
    );
}
