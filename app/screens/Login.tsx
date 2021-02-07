import React from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Styles, ApiHelper, LoginResponseInterface, UserHelper, Utils } from "./components";
import { stackNavigationProps } from "./StackScreens";
import { Container } from "native-base";

type Props = { navigation: stackNavigationProps; };

export function Login(props: Props) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const validate = () => {
        const result: string[] = [];
        if (email === "") result.push("Please enter and email address.");
        if (password === "") result.push("Please enter your password.");
        if (result.length > 0) Utils.errorMsg(result[0])
        return result;
    }





    const handlePress = () => {
        console.log("LOGGING IN");
        const errors = validate();
        if (errors.length === 0) {
            console.log("NO ERRORS");
            setIsLoading(true);
            const data = { email: email, password: password };
            console.log(data);
            ApiHelper.postAnonymous("/users/login", data, "AccessApi").then((resp: LoginResponseInterface) => {
                if (resp.errors !== undefined) UserHelper.handleLoginErrors(resp.errors);
                else {
                    UserHelper.handleLoginSuccess(resp);
                    AsyncStorage.multiSet([["@LoggedIn", "true"], ["@Email", email], ["@Password", password]]);
                    props.navigation.navigate("ChurchSearch");
                }
                setIsLoading(false);
            }).catch((e) => {
                console.log(e);
                Utils.errorMsg(JSON.stringify(e));
                //Utils.errorMsg("Invalid username or password."); 
                setIsLoading(false);
            });
        }

    }

    return (
        <SafeAreaView style={Styles.safeArea}>
            <View style={Styles.headerImageView}>
                <Image source={require("../images/LogoWhite.png")} style={Styles.headerImage} resizeMode="contain" />
            </View>
            <Container style={Styles.mainContainer} >
                <Text style={Styles.H1}>Welcome.  Please Log in.</Text>
                <Text style={Styles.label}>Email</Text>
                <TextInput style={Styles.textInput} autoCompleteType="email" value={email} onChangeText={(val) => setEmail(val)} />
                <Text style={Styles.label}>Password</Text>
                <TextInput style={Styles.textInput} autoCompleteType="password" secureTextEntry={true} value={password} onChangeText={(val) => setPassword(val)} />
                <TouchableOpacity style={Styles.button} onPress={handlePress} >
                    <ActivityIndicator size="small" color="#FFFFFF" animating={isLoading} style={{ display: isLoading ? "flex" : "none" }} />
                    <Text style={[Styles.buttonText, { display: isLoading ? "none" : "flex" }]}>LOGIN</Text>
                </TouchableOpacity>
            </Container>
        </SafeAreaView>

    );
}


