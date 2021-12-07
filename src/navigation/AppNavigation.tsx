import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from '../screens/SplashScreen';
import { WebsiteScreen } from '../screens/WebsiteScreen';
import { CustomDrawer } from '../components';
import { ChurchSearch } from '../screens/ChurchSearch';
import { LoginScreen } from '../screens/LoginScreen';
import { HouseholdScreen } from '../screens/checkin/HouseholdScreen';
import { GroupsScreen } from '../screens/checkin/GroupsScreen';
import CheckinCompleteScreen from '../screens/checkin/CheckinCompleteScreen';
import { ServiceScreen } from '../screens/checkin/ServiceScreen';
import { MembersSearch } from '../screens/MembersSearch';
import { MemberDetailScreen } from '../screens/MemberDetailScreen';
import DonationScreen from '../screens/DonationScreen';
import { globalStyles } from '../helpers';

const AppNav = createStackNavigator();
const AuthNav = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
  //Note:  By not combining the Website screen users can toggle between them without their current page on each tab being lost

  return (
    <Drawer.Navigator initialRouteName={'WebsiteScreen'} drawerType={'slide'} drawerStyle={globalStyles.drawerStyle} drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen name={'BibleScreen'} component={WebsiteScreen} />
      <Drawer.Screen name={'LessonsScreen'} component={WebsiteScreen} />
      <Drawer.Screen name={'StreamScreen'} component={WebsiteScreen} />
      <Drawer.Screen name={'WebsiteScreen'} component={WebsiteScreen} />
      <Drawer.Screen name={'PageScreen'} component={WebsiteScreen} />

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