import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Login, Splash, StackScreens } from "./app/screens";
import { createStackNavigator } from "@react-navigation/stack"
import { DrawerContainer } from "./app/screens/DrawerContainer";

export default function App() {

  const StackNav = createStackNavigator<StackScreens>();


  const getStack = () => {
    return (<StackNav.Navigator screenOptions={{ headerShown: false, animationEnabled: false }} >
      <StackNav.Screen name="Splash" component={Splash} />
      <StackNav.Screen name="Login" component={Login} />
      <StackNav.Screen name="Home" component={DrawerContainer} />
    </StackNav.Navigator>);
  }

  return (
    <NavigationContainer>
      {getStack()}
    </NavigationContainer>
  );
}