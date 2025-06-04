import React from 'react';
import { ImageButton } from '@/src/components/ImageButton';
// Loader is used by LoadingWrapper internally
import { MainHeader } from '@/src/components/wrapper/MainHeader';
import { CacheHelper, LinkInterface, UserHelper, globalStyles } from '@/src/helpers';
import { NavigationHelper } from '@/src/helpers/NavigationHelper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, View, StyleSheet } from 'react-native'; // Text removed
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { LinearGradient } from 'expo-linear-gradient';
import { Text as PaperText, useTheme } from 'react-native-paper';

const Dashboard = (props: any) => {
  const theme = useTheme(); // Added useTheme
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const nav = useNavigation<NavigationProp<any>>();
  const focused = useIsFocused();

  const [isLoading, setLoading] = useState(false);
  // dimension state seems unused in render, keeping logic for now
  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setDimension(screen);
    });
    UserHelper.addOpenScreenEvent('Dashboard');
    return () => subscription?.remove();
  }, []);

  // useEffect for dimension is empty, can be removed if not used
  // useEffect(() => {
  // }, [dimension])

  useEffect(() => {
    checkRedirect();
  }, [focused]);

  const checkRedirect = () => {
    if (!CacheHelper.church) {
      router.navigate('/(drawer)/churchSearch');
    }
  };

  // const brandColor = '#175ec1'; // Replaced by theme.colors.primary
  const getButton = (topItem: boolean, item: LinkInterface) => {
    if (item.linkType === "separator") return (<></>);
    let backgroundImage = undefined;

    if (item.photo) {
      backgroundImage = { uri: item.photo };
    } else {
      switch (item.linkType.toLowerCase()) {
        case "groups": backgroundImage = require('@/src/assets/images/dash_worship.png'); break;
        case "checkin": backgroundImage = require('@/src/assets/images/dash_checkin.png'); break;
        case "donation": backgroundImage = require('@/src/assets/images/dash_donation.png'); break;
        case "directory": backgroundImage = require('@/src/assets/images/dash_directory.png'); break;
        case "plans": backgroundImage = require('@/src/assets/images/dash_votd.png'); break;
        case "chums": backgroundImage = require('@/src/assets/images/dash_url.png'); break;
        default: backgroundImage = require('@/src/assets/images/dash_url.png'); break;
      }
    }

    return (
      <ImageButton key={item.id} text={item.text} onPress={() => {
        NavigationHelper.navigateToScreen(item, router.navigate)
      }} color={theme.colors.primary} backgroundImage={backgroundImage} /> // Use theme color
    );
  }

  const getButtons = () => {
    if (!Array.isArray(UserHelper.links)) return null;
    const items = UserHelper.links.filter(item => item.linkType !== 'separator');
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }
    return (
      <View style={{ marginTop: 16, paddingHorizontal: 12 }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={localStyles.row}>
            {row.map((item, colIndex) => (
              <View key={item.id || colIndex} style={localStyles.buttonWrapper}>
                {getButton(false, item)}
              </View>
            ))}
            {/* Add a spacer view if there's only one item in the last row to maintain layout */}
            {row.length === 1 && <View style={localStyles.buttonWrapper} />}
          </View>
        ))}
      </View>
    );
  }

  const getBrand = () => {
    if (UserHelper.churchAppearance?.logoLight) {
      return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={localStyles.brandImage} resizeMode="contain" />
    } else {
      return <PaperText variant="headlineSmall" style={localStyles.brandText}>{CacheHelper.church?.name || ""}</PaperText>
    }
  }

  return (
    <LoadingWrapper loading={isLoading}>
      <LinearGradient
        colors={['#F8F9FA', '#F0F2F5']} // These colors can be themed if desired
        style={localStyles.gradientContainer}
      >
        {/* globalStyles.grayContainer might set a background color, ensure it's compatible or uses theme.colors.background */}
        <SafeAreaView style={[globalStyles.grayContainer, localStyles.safeArea, { backgroundColor: theme.colors.background }]}>
          <MainHeader title="Home" openDrawer={() => navigation.openDrawer()} />
          {/* globalStyles.webViewContainer might also have styles to review */}
          <ScrollView style={[globalStyles.webViewContainer, {backgroundColor: 'transparent'}]} contentContainerStyle={localStyles.scrollContent}>
            <View style={localStyles.brandContainer}>
              {getBrand()}
            </View>
            {getButtons()}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </LoadingWrapper>
  )
}

// Renamed styles to localStyles to avoid confusion with globalStyles
const localStyles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    alignSelf: "center",
    width: '100%',
    flex: 1, // Ensure SafeAreaView takes full height of gradient
  },
  scrollContent: {
    flexGrow: 1,
  },
  brandContainer: { // Added a container for brand to control alignment/padding
    alignItems: 'center', // Center logo/text
    paddingVertical: 20, // Add some padding
  },
  brandImage: {
    width: "80%", // Adjust as needed
    height: DimensionHelper.wp(25), // Keep original height for now
  },
  brandText: {
    // fontSize: 20, // Handled by PaperText variant="headlineSmall"
    width: "100%",
    textAlign: "center",
    // marginTop: 0, // Handled by brandContainer padding
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    width: '48%', // Ensure this creates the two-column layout
  }
});

export default Dashboard;
