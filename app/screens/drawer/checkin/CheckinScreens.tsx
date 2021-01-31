import { StackNavigationProp } from "@react-navigation/stack";
import { ServiceTimeInterface } from "./components";
import { createStackNavigator } from "@react-navigation/stack"

export const CheckinStackNav = createStackNavigator<CheckinScreens>();
export type checkinNavigationProps = StackNavigationProp<CheckinScreens, "Services">

export type CheckinScreens = {
    SelectPerson: undefined,
    Services: undefined,
    AddGuest: undefined,
    Household: undefined,
    CheckinComplete: undefined,
    SelectGroup: { serviceTime: ServiceTimeInterface, personId: number },
}
