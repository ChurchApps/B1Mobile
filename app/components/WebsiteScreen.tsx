import { useEffect, useState, useRef } from 'react';
import { SafeAreaView, View, Linking, Text } from 'react-native';
import { router, useNavigation } from 'expo-router';
import WebView from 'react-native-webview';
import { Loader, MainHeader } from '../components';
import { CacheHelper, Utilities, globalStyles } from '../../src/helpers';
import { DrawerNavigationProp } from '@react-navigation/drawer';
interface WebsiteScreenProps {
  url: any;
  title: any;
}

export function WebsiteScreen({ url, title }: WebsiteScreenProps) {
  // const navigation = useNavigation();
     const navigation = useNavigation<DrawerNavigationProp<any>>();
  
  const [isLoading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const webviewRef = useRef<any>();

  useEffect(() => {
    // Utilities.trackEvent('Website Screen', { url });
    if (!CacheHelper.church)  router.navigate('/(drawer)/churchSearch');
  
  }, []);

  const handleMessage = (event: any) => {
    let newUrl = currentUrl + "&autoPrint=1";
    Linking.openURL(newUrl);
  };

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={title || 'Home'} openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <View style={globalStyles.webViewContainer}>
        <WebView
          ref={webviewRef}
          source={{ uri: url }}
          onMessage={handleMessage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(state: any) => setCurrentUrl(state.url)}
          scalesPageToFit={false}
          allowsInlineMediaPlayback
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
}

