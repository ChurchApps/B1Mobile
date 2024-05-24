import { DimensionHelper } from '@churchapps/mobilehelper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { CustomDrawer } from '../components';
import { Constants } from '../helpers';
import { CheckinScreen } from '../screens/CheckinScreen';
import { ChurchSearch } from '../screens/ChurchSearch';
import { DashboardScreen } from '../screens/DashboardScreen';
import DonationScreen from '../screens/DonationScreen';
import GroupDetails from '../screens/GroupDetails';
import { LoginScreen } from '../screens/LoginScreen';
import { MemberDetailScreen } from '../screens/MemberDetailScreen';
import { MembersSearch } from '../screens/MembersSearch';
import { MessagesScreen } from '../screens/MessagesScreen';
import MyGroups from '../screens/MyGroups';
import { PlanDetails } from '../screens/PlanDetails';
import { PlanScreen } from '../screens/PlanScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SearchUserScreen } from '../screens/SearchUserScreen';
import SplashScreen from '../screens/SplashScreen';
import { VotdScreen } from '../screens/VotdScreen';
import { WebsiteScreen } from '../screens/WebsiteScreen';

const AppNav = createStackNavigator();
const AuthNav = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
  const [dimensions, setDimensions] = React.useState("1,1");
  
  const init = () => {
    DimensionHelper.listenOrientationChange(this, () => {
      setDimensions(DimensionHelper.wp("100%") + "," + DimensionHelper.hp("100%"))
    });

    return destroy;
  }

  const destroy = () => {
    DimensionHelper.removeOrientationListener();
  }

  React.useEffect(init, []);
  if (dimensions!=="1,1") console.log(dimensions);
  
  //Note:  By not combining the Website screen users can toggle between them without their current page on each tab being lost

  return (
    <Drawer.Navigator screenOptions={{
      headerShown : false , 
      drawerStyle: { width:DimensionHelper.wp('60%'),height:DimensionHelper.hp('100%'), backgroundColor: Constants.Colors.app_color }, drawerType:'slide' }} 
      initialRouteName={'WebsiteScreen'} 
      drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen name={'Dashboard'} component={DashboardScreen} />
      <Drawer.Screen name={'BibleScreen'} component={WebsiteScreen} options={{unmountOnBlur:true}}/>
      <Drawer.Screen name={'VotdScreen'} component={VotdScreen} />
      <Drawer.Screen name={'LessonsScreen'} component={WebsiteScreen} options={{unmountOnBlur:true}}/>
      <Drawer.Screen name={'StreamScreen'} component={WebsiteScreen} options={{unmountOnBlur:true}}/>
      <Drawer.Screen name={'WebsiteScreen'} component={WebsiteScreen} options={{unmountOnBlur:true}} />
      <Drawer.Screen name={'PageScreen'} component={WebsiteScreen} options={{unmountOnBlur:true}}/>
      <Drawer.Screen name={'ChurchSearch'} component={ChurchSearch} />
      <Drawer.Screen name={'SearchMessageUser'} component={SearchUserScreen} />
      <Drawer.Screen name={'MembersSearch'} component={MembersSearch} />
      <Drawer.Screen name={'MemberDetailScreen'} component={MemberDetailScreen} />
      <Drawer.Screen name={'ServiceScreen'} component={CheckinScreen} />
      <Drawer.Screen name={'DonationScreen'} component={DonationScreen} />
      <Drawer.Screen name={'MyGroups'} component={MyGroups} />
      <Drawer.Screen name={'GroupDetails'} component={GroupDetails} />
      <Drawer.Screen name={'PlanScreen'} component={PlanScreen} />
      <Drawer.Screen name={'PlanDetails'} component={PlanDetails} />
      
    </Drawer.Navigator>
  );
}

const AuthStack = () => {
  return (
    <AuthNav.Navigator screenOptions={{headerShown:false}} initialRouteName={'LoginScreen'}>
      <AuthNav.Screen name={'LoginScreen'} component={LoginScreen} />
      <AuthNav.Screen name={'RegisterScreen'} component={RegisterScreen} />
    </AuthNav.Navigator>
  );
}

const AppNavigation = (props: any) => {
  return (
    <NavigationContainer>
      <AppNav.Navigator screenOptions={{headerShown:false, animationEnabled:false}} initialRouteName='SplashScreen'  >
        <AppNav.Screen name="SplashScreen" component={SplashScreen} />
        <AppNav.Screen name="AuthStack" component={AuthStack} />
        <AppNav.Screen name="MainStack" component={MainStack} />
        <AppNav.Screen name={'MessagesScreen'} component={MessagesScreen} />
      </AppNav.Navigator>
    </NavigationContainer>
  );
};

export default (AppNavigation);