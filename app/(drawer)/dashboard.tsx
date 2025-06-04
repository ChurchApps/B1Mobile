import React from 'react';
import { ImageButton } from '@/src/components/ImageButton';
import { MainHeader } from '@/src/components/wrapper/MainHeader'; // Assume this will be/is Paper-based
import { CacheHelper, LinkInterface, UserHelper } from '@/src/helpers'; // globalStyles removed
import { NavigationHelper } from '@/src/helpers/NavigationHelper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper'; // Still used for brandImage height
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { LinearGradient } from 'expo-linear-gradient';
import { Text as PaperText, useTheme, Surface } from 'react-native-paper'; // Added Surface

const Dashboard = (props: any) => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  // const nav = useNavigation<NavigationProp<any>>(); // nav seems unused
  const focused = useIsFocused();

  const [isLoading, setLoading] = useState(false);
  const [dimension, setDimension] = useState(Dimensions.get('screen')); // Unused in render, but effect subscribed

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setDimension(screen);
    });
    UserHelper.addOpenScreenEvent('Dashboard');
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    checkRedirect();
  }, [focused]);

  const checkRedirect = () => {
    if (!CacheHelper.church) {
      router.navigate('/(drawer)/churchSearch');
    }
  };

  const getButton = (topItem: boolean, item: LinkInterface) => {
    if (item.linkType === "separator") return (<></>);
    let backgroundImageSource = undefined; // Renamed to avoid conflict with component prop

    if (item.photo) {
      backgroundImageSource = { uri: item.photo };
    } else {
      switch (item.linkType.toLowerCase()) {
        case "groups": backgroundImageSource = require('@/src/assets/images/dash_worship.png'); break;
        case "checkin": backgroundImageSource = require('@/src/assets/images/dash_checkin.png'); break;
        case "donation": backgroundImageSource = require('@/src/assets/images/dash_donation.png'); break;
        case "directory": backgroundImageSource = require('@/src/assets/images/dash_directory.png'); break;
        case "plans": backgroundImageSource = require('@/src/assets/images/dash_votd.png'); break;
        case "chums": backgroundImageSource = require('@/src/assets/images/dash_url.png'); break;
        default: backgroundImageSource = require('@/src/assets/images/dash_url.png'); break;
      }
    }

    return (
      <ImageButton
        key={item.id}
        text={item.text}
        onPress={() => { NavigationHelper.navigateToScreen(item, router.navigate) }}
        // color prop in ImageButton now refers to text color, use theme.colors.primary if that was the intent
        // For ImageButton, the internal logic now tries to set good default text color based on background.
        // If specific color from theme.colors.primary was for the border/accent, Card style prop can be used.
        backgroundImage={backgroundImageSource}
        style={{ marginVertical: 4 / 2 }} // Add some vertical spacing between buttons in a column
      />
    );
  }

  const getButtons = () => {
    if (!Array.isArray(UserHelper.links)) return null;
    const items = UserHelper.links.filter(item => item.linkType !== 'separator');
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }

    // Use StyleSheet for localStyles now defined within the component or passed theme
    const localStyles = StyleSheet.create({
      buttonContainer: {
        marginTop: 8, // Use theme spacing
        paddingHorizontal: 8, // Use theme spacing
      },
      row: {
        flexDirection: 'row',
        marginBottom: 8, // Use theme spacing
        justifyContent: 'space-between',
      },
      buttonWrapper: {
        width: '48%',
      }
    });

    return (
      <View style={localStyles.buttonContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={localStyles.row}>
            {row.map((item, colIndex) => (
              <View key={item.id || colIndex} style={localStyles.buttonWrapper}>
                {getButton(false, item)}
              </View>
            ))}
            {row.length === 1 && <View style={localStyles.buttonWrapper} />}
          </View>
        ))}
      </View>
    );
  }

  const getBrand = () => {
    // Use StyleSheet for localStyles now defined within the component or passed theme
    const localStyles = StyleSheet.create({
      brandImage: {
        width: "80%",
        height: DimensionHelper.wp(25), // Keep for now, review later if it can be theme-based
        alignSelf: 'center', // ensure centered if parent is not aligning
      },
      brandText: {
        width: "100%",
        textAlign: "center",
        color: theme.colors.onSurface, // Ensure text color comes from theme
      }
    });

    if (UserHelper.churchAppearance?.logoLight) {
      return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={localStyles.brandImage} resizeMode="contain" />;
    } else {
      return <PaperText variant="headlineSmall" style={localStyles.brandText}>{CacheHelper.church?.name || ""}</PaperText>;
    }
  }

  // Define styles outside functions using them, or pass theme to them if defined inside.
  // For this refactor, defining styles closer to their usage or at component root.
  const screenStyles = StyleSheet.create({
    gradientContainer: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      // Removed alignSelf and width: '100%' as SafeAreaView usually handles this well.
      // globalStyles.grayContainer replacement:
      backgroundColor: theme.colors.background, // Use theme background
    },
    scrollView: {
      // globalStyles.webViewContainer replacement (assuming it was mostly for flex:1 and bg color)
      flex: 1,
      backgroundColor: 'transparent', // Keep transparent to see gradient
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 16, // Add padding at the bottom
    },
    brandContainer: {
      alignItems: 'center',
      paddingVertical: 16, // Use theme spacing
    },
  });

  // Attempt to map LinearGradient colors to theme or use slightly modified versions
  // These specific gradient colors might be part of branding and not directly in theme.
  // Using theme.colors.surface and a slightly lighter version of background as an example.
  const gradientColors = theme.dark ?
   [theme.colors.surface, theme.colors.background] : // Dark mode example
   [theme.colors.surface, '#F0F2F5']; // Default light mode, one color still hardcoded

  return (
    <LoadingWrapper loading={isLoading}>
      <LinearGradient
        colors={gradientColors}
        style={screenStyles.gradientContainer}
      >
        <SafeAreaView style={screenStyles.safeArea}>
          {/* Assuming MainHeader is or will be Paper-based and theme-aware */}
          <MainHeader title="Home" openDrawer={() => navigation.openDrawer()} />
          <ScrollView
            style={screenStyles.scrollView}
            contentContainerStyle={screenStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={screenStyles.brandContainer}>
              {getBrand()}
            </View>
            {getButtons()}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </LoadingWrapper>
  );
}

export default Dashboard;
