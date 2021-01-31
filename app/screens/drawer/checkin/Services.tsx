import React from "react"
import { View, Text, FlatList, ActivityIndicator } from "react-native"
import Ripple from "react-native-material-ripple"
import { ApiHelper, ChumsCachedData, Styles, StyleConstants, EnvironmentHelper } from "./components"
import { checkinNavigationProps } from "./CheckinScreens"

interface Props { navigation: checkinNavigationProps }

export const Services = (props: Props) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [services, setServices] = React.useState([]);

    const loadData = () => {
        setIsLoading(true);
        ApiHelper.apiGet(EnvironmentHelper.ChumsApiUrl + "/services").then(data => { setServices(data); setIsLoading(false); });
    }

    const selectService = (serviceId: number) => {
        setIsLoading(true);
        ApiHelper.apiGet(EnvironmentHelper.ChumsApiUrl + "/servicetimes?serviceId=" + serviceId + "&include=groups").then(data => {
            setIsLoading(false);
            ChumsCachedData.serviceId = serviceId;
            ChumsCachedData.serviceTimes = data;
            props.navigation.navigate("Household");
        });
    }

    const getRow = (data: any) => {
        const item = data.item;
        return (
            <Ripple style={Styles.bigLinkButton} onPress={() => { selectService(item.id) }}>
                <Text style={Styles.bigLinkButtonText}>{item.campus.name} - {item.name}</Text>
            </Ripple>
        );
    }

    const getResults = () => {
        if (isLoading) return (<ActivityIndicator size="large" color={StyleConstants.baseColor1} animating={isLoading} style={{ marginTop: "25%" }} />)
        else return (<FlatList data={services} renderItem={getRow} keyExtractor={(item: any) => item.id.toString()} />);
    }

    React.useEffect(loadData, []);

    return (
        <View style={Styles.mainContainer} >
            <Text style={Styles.H1}>Select a service:</Text>
            {getResults()}
        </View>
    )
}
