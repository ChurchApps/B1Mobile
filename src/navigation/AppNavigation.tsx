import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import CustomDrawer from '../components/CustomDrawer';

const AppNav = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
    return (
        <Drawer.Navigator
            initialRouteName={'HomeScreen'}
            drawerType={'slide'}
            drawerContent={(props) => <CustomDrawer {...props} />}>
            <Drawer.Screen
                name={'HomeScreen'}
                component={HomeScreen}
            />
        </Drawer.Navigator>
    );
}

const AppNavigation = (props: {}) => {
    return (
        <NavigationContainer>
            <AppNav.Navigator headerMode="none" initialRouteName='SplashScreen'>
                <AppNav.Screen name="SplashScreen" component={SplashScreen} />
                <AppNav.Screen name="MainStack" component={MainStack} />
            </AppNav.Navigator>
        </NavigationContainer>
    );
};

export default (AppNavigation);
