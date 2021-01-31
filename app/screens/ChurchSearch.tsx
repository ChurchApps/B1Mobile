import React from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, FlatList, ListRenderItem, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Styles, ApiHelper, EnvironmentHelper, Utils, ChurchInterface, UserHelper } from "./components";
import Ripple from "react-native-material-ripple"
import { stackNavigationProps } from "./StackScreens";

type Props = { navigation: stackNavigationProps; };

export function ChurchSearch(props: Props) {
    const [name, setName] = React.useState("");
    const [churches, setChurches] = React.useState<ChurchInterface[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const validate = () => {
        const result: string[] = [];
        if (name === "") result.push("Please enter a church name.");
        if (result.length > 0) Utils.errorMsg(result[0])
        return result;
    }

    const handleSearch = () => {
        const errors = validate();
        if (errors.length === 0) {
            setIsLoading(!isLoading);
            ApiHelper.apiGetAnonymous(EnvironmentHelper.AccessManagementApiUrl + "/churches/search?name=" + escape(name) + "&app=B1").then((resp: ChurchInterface[]) => {
                setChurches(resp);
                setIsLoading(false);
            }).catch((e) => { Utils.errorMsg("No matches found"); setIsLoading(false); });
        }
    }

    const selectChurch = (church: ChurchInterface) => {
        UserHelper.currentChurch = church;
        props.navigation.navigate("Home");
    }

    const renderItem: ListRenderItem<ChurchInterface> = ({ item }) => {
        return (
            <Ripple rippleSize={176} style={{ height: 40 }} onPress={() => selectChurch(item)}  >
                <Text style={[{ marginLeft: "7%" }]}>{item.name}</Text>
            </Ripple >
        )
    }

    return (
        <SafeAreaView style={Styles.safeArea}>
            <View style={Styles.headerImageView}>
                <Image source={require("../images/LogoWhite.png")} style={Styles.headerImage} resizeMode="contain" />
            </View>
            <View style={Styles.mainContainer} >
                <Text style={Styles.H1}>Find Your Church</Text>
                <Text style={Styles.label}>Name</Text>
                <TextInput style={Styles.textInput} value={name} onChangeText={(val) => setName(val)} />
                <TouchableOpacity style={Styles.button} onPress={handleSearch} >
                    <ActivityIndicator size="small" color="#FFFFFF" animating={isLoading} style={{ display: isLoading ? "flex" : "none" }} />
                    <Text style={[Styles.buttonText, { display: isLoading ? "none" : "flex" }]}>SEARCH</Text>
                </TouchableOpacity>
                <FlatList data={churches} renderItem={renderItem} keyExtractor={item => item.id?.toString() || ""} />
            </View>
        </SafeAreaView>
    );
}


