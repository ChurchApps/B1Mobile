import { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, SafeAreaView, View } from 'react-native';
import WebView from 'react-native-webview';
import { CacheHelper, globalStyles } from '../../src/helpers';
import { Loader } from './Loader';
import { MainHeader } from './wrapper/MainHeader';

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
    Utilities.trackEvent('Website Screen', { url });
    if (!CacheHelper.church) router.navigate('/(drawer)/churchSearch');

  }, []);

  const handleMessage = (event: any) => {
    let newUrl = currentUrl + "&autoPrint=1";
    Linking.openURL(newUrl);
  };

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={title || 'Home'} openDrawer={navigation.openDrawer} back={() => router.navigate('/(drawer)/dashboard')} />
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

