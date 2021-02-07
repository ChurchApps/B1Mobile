import React from "react"
import { CommonActions } from "@react-navigation/native";
import { stackNavigationProps } from ".";
import { useFonts, Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, Roboto_900Black } from "@expo-google-fonts/roboto";
import AppLoading from "expo-app-loading";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ApiHelper, EnvironmentHelper, UserHelper, LoginResponseInterface } from "./components";

type Props = { navigation: stackNavigationProps; };

export const Splash = (props: Props) => {
    const [fontsLoaded] = useFonts({ Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_900Black, Roboto_700Bold });
    const [isLoading, setIsLoading] = React.useState(true);
    const [loggedIn, setLoggedIn] = React.useState(false);

    const loadData = async () => {
        await AsyncStorage.multiGet(["@LoggedIn", "@Email", "@Password"]).then(response => {
            const login = response[0][1] === "true";
            if (login) {
                const email = response[1][1];
                const password = response[2][1];
                attemptLogin(email || "", password || "");
            } else setIsLoading(false);
        });
    }

    const attemptLogin = (email: string, password: string) => {
        ApiHelper.postAnonymous("/users/login", { email: email, password: password }, "AccessApi").then((resp: LoginResponseInterface) => {
            UserHelper.handleLogin(resp).then(() => {
                AsyncStorage.multiSet([["@LoggedIn", "true"], ["@Email", email], ["@Password", password]]);
                setLoggedIn(true);
                setIsLoading(false);
            });
        }).catch((e) => { setLoggedIn(false); setIsLoading(false); });
    }

    const redirect = (page: string) => { props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: page }] })); }

    React.useEffect(() => { loadData() }, []);

    if (fontsLoaded && !isLoading) {
        if (!loggedIn) redirect("Login");
        else redirect("Home")
    }
    return (<AppLoading />)

}