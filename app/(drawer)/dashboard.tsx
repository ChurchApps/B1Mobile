import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigationProp, useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider as PaperProvider, Appbar, Card, Text, useTheme, Surface, ActivityIndicator, MD3LightTheme, adaptNavigationTheme, Portal, Modal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { CacheHelper, UserHelper, Constants } from '@/src/helpers';
import { NavigationHelper } from '@/src/helpers/NavigationHelper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { LinkInterface } from '@/src/helpers/Interfaces';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderBell } from '@/src/components/wrapper/HeaderBell';
import { NotificationTab } from '@/src/components/NotificationView';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#175ec1',
    secondary: '#f0f2f5',
  },
};

const Dashboard = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const nav = useNavigation<NavigationProp<any>>();
  const focused = useIsFocused();
  const paperTheme = useTheme();
  const [isLoading, setLoading] = useState(false);
  const [dimension, setDimension] = useState(Dimensions.get('screen'));
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimension(Dimensions.get('screen'));
    });
    UserHelper.addOpenScreenEvent('Dashboard');
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (focused) checkRedirect();
  }, [focused]);

  const checkRedirect = () => {
    if (!CacheHelper.church) router.navigate('/(drawer)/churchSearch');
  };

  const getButton = (item: LinkInterface) => {
    if (item.linkType === "separator") return null;
    let backgroundImage = item.photo ? { uri: item.photo } :
      item.linkType.toLowerCase() === "groups" ? require('@/src/assets/images/dash_worship.png') :
        item.linkType.toLowerCase() === "checkin" ? require('@/src/assets/images/dash_checkin.png') :
          item.linkType.toLowerCase() === "donation" ? require('@/src/assets/images/dash_donation.png') :
            item.linkType.toLowerCase() === "directory" ? require('@/src/assets/images/dash_directory.png') :
              item.linkType.toLowerCase() === "plans" ? require('@/src/assets/images/dash_votd.png') :
                require('@/src/assets/images/dash_url.png');

    return (
      <Card key={item.id} style={styles.card} mode="elevated" onPress={() => NavigationHelper.navigateToScreen(item, router.navigate)}>
        <Card.Cover source={backgroundImage} style={styles.cardImage} />
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.cardText}>{item.text}</Text>
        </Card.Content>
      </Card>
    );
  };

  const getButtons = () => {
    if (!Array.isArray(UserHelper.links)) return null;
    const items = UserHelper.links.filter(item => item.linkType !== 'separator');
    return (
      <View style={styles.gridContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            {getButton(item)}
          </View>
        ))}
      </View>
    );
  };

  const getBrand = () => {
    if (UserHelper.churchAppearance?.logoLight) {
      return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={styles.logo} />;
    }
    return <Text variant="headlineMedium" style={styles.churchName}>{CacheHelper.church?.name || ""}</Text>;
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={isLoading}>
          <LinearGradient colors={['#F8F9FA', '#F0F2F5']} style={styles.gradientContainer}>
            <SafeAreaView style={styles.container} edges={['top']}>
              <Appbar.Header>
                <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
                <Appbar.Content title="Home" />
                <View style={styles.bellContainer}>
                  <View style={styles.bellWrapper}>
                    <HeaderBell toggleNotifications={() => setShowNotifications(true)} />
                  </View>
                </View>
              </Appbar.Header>
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.brandContainer} elevation={0}>
                  {getBrand()}
                </Surface>
                {getButtons()}
              </ScrollView>
              <Portal>
                <Modal visible={showNotifications} onDismiss={() => setShowNotifications(false)} contentContainerStyle={styles.modalContainer}>
                  <NotificationTab />
                </Modal>
              </Portal>
            </SafeAreaView>
          </LinearGradient>
        </LoadingWrapper>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  brandContainer: { padding: 16, alignItems: 'center', backgroundColor: 'transparent' },
  logo: { width: '100%', height: DimensionHelper.wp(25), resizeMode: 'contain' },
  churchName: { textAlign: 'center', marginTop: 8, color: theme.colors.primary },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 16 },
  card: { height: 160, overflow: 'hidden' },
  cardImage: { height: 120 },
  cardContent: { padding: 8, alignItems: 'center' },
  cardText: { textAlign: 'center', color: theme.colors.primary },
  bellContainer: {
    marginRight: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bellWrapper: {
    transform: [{ scale: 1.2 }],
    opacity: 0.87
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    height: '80%',
    overflow: 'hidden'
  }
});

export default Dashboard;
