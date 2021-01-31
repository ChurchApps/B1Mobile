import React from "react"
import { View, Text, FlatList, ActivityIndicator } from "react-native"
import Ripple from "react-native-material-ripple"
import { ApiHelper, ChumsCachedData, Styles, StyleConstants, EnvironmentHelper, PersonInterface, UserHelper } from "./components"
import { checkinNavigationProps } from "./CheckinScreens"

interface Props { navigation: checkinNavigationProps }

export const SelectPerson = (props: Props) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [people, setPeople] = React.useState<PersonInterface[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        var person: PersonInterface = await ApiHelper.apiGet(EnvironmentHelper.ChumsApiUrl + "/people/userId/" + UserHelper.user.id);
        if (person !== null) selectPerson(person);
        else {
            var people: PersonInterface[] = await ApiHelper.apiGet(EnvironmentHelper.ChumsApiUrl + "/people/search?email=" + escape(UserHelper.user.email || "undefinedemail"));
            if (people.length === 1) selectPerson(people[0]);
            else setPeople(people);
            setIsLoading(false);
        }
    }

    const selectPerson = (person: PersonInterface) => {
        setIsLoading(true);
        ChumsCachedData.householdId = person.householdId || 0;
        ApiHelper.apiPost(EnvironmentHelper.ChumsApiUrl + "/people/" + person.id + "/claim", {}).then(data => {
            ApiHelper.apiGet(EnvironmentHelper.ChumsApiUrl + "/people/household/" + ChumsCachedData.householdId).then(data => {
                ChumsCachedData.householdMembers = data
                props.navigation.navigate("Services");
            });
        })
    }

    const getRow = (data: any) => {
        const person: PersonInterface = data.item;
        return (
            <Ripple style={Styles.bigLinkButton} onPress={() => { selectPerson(person) }}>
                <Text style={Styles.bigLinkButtonText}>{person.name.display}</Text>
            </Ripple>
        );
    }

    const getResults = () => {
        if (people.length === 0) return (<Text>Please contact the church staff for access.</Text>)
        return (<FlatList data={people} renderItem={getRow} keyExtractor={(item: any) => item.id.toString()} />);
    }

    React.useEffect(() => { loadData() }, []);

    if (isLoading) return (<ActivityIndicator size="large" color={StyleConstants.baseColor1} animating={isLoading} style={{ marginTop: "25%" }} />)
    else return (
        <View style={Styles.mainContainer} >
            <Text style={Styles.H1}>Select person:</Text>
            {getResults()}
        </View>
    )
}
