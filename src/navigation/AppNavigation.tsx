import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import { CustomDrawer } from '../components';
import { ChurchSearch } from '../screens/ChurchSearch';
import { LoginScreen } from '../screens/LoginScreen';
import HouseholdScreen from '../screens/checkin/HouseholdScreen';
import GroupsScreen from '../screens/checkin/GroupsScreen';
import CheckinCompleteScreen from '../screens/checkin/CheckinCompleteScreen';
import ServiceScreen from '../screens/checkin/ServiceScreen';
import { MembersSearch } from '../screens/MembersSearch';
import MemberDetailScreen from '../screens/MemberDetailScreen';
import DonationScreen from '../screens/DonationScreen';
import { globalStyles } from '../helpers';

const AppNav = createStackNavigator();
const AuthNav = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
  return (
    <Drawer.Navigator initialRouteName={'HomeScreen'} drawerType={'slide'} drawerStyle={globalStyles.drawerStyle} drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen name={'HomeScreen'} component={HomeScreen} />
      <Drawer.Screen name={'ChurchSearch'} component={ChurchSearch} />
      <Drawer.Screen name={'MembersSearch'} component={MembersSearch} />
      <Drawer.Screen name={'MemberDetailScreen'} component={MemberDetailScreen} />
      <Drawer.Screen name={'ServiceScreen'} component={ServiceScreen} />
      <Drawer.Screen name={'HouseholdScreen'} component={HouseholdScreen} />
      <Drawer.Screen name={'GroupsScreen'} component={GroupsScreen} />
      <Drawer.Screen name={'CheckinCompleteScreen'} component={CheckinCompleteScreen} />
      <Drawer.Screen name={'DonationScreen'} component={DonationScreen} />
    </Drawer.Navigator>
  );
}

const AuthStack = () => {
  return (
    <AuthNav.Navigator headerMode="none" initialRouteName={'LoginScreen'}>
      <AuthNav.Screen name={'LoginScreen'} component={LoginScreen} />
    </AuthNav.Navigator>
  );
}

const AppNavigation = (props: {}) => {
  return (
    <NavigationContainer>
      <AppNav.Navigator headerMode="none" initialRouteName='SplashScreen'>
        <AppNav.Screen name="SplashScreen" component={SplashScreen} />
        <AppNav.Screen name="AuthStack" component={AuthStack} />
        <AppNav.Screen name="MainStack" component={MainStack} />
      </AppNav.Navigator>
    </NavigationContainer>
  );
};

export default (AppNavigation);