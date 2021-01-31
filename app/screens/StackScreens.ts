import { StackNavigationProp } from '@react-navigation/stack'

export type StackScreens = {
    Splash: undefined,
    Login: undefined,
    Home: undefined,
    ChurchSearch: undefined
}

export type stackNavigationProps = StackNavigationProp<StackScreens, "Splash">