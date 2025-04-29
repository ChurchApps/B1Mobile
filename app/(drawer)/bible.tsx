import React, { useEffect, useRef, useState } from 'react';
import { Linking, SafeAreaView, View } from 'react-native';
import WebView from 'react-native-webview';
import { Loader, MainHeader, WebsiteScreen } from '../components';
import { CacheHelper, Utilities, globalStyles } from '@/src/helpers';
import { NavigationProps } from '@/src/interfaces';
import { router, useLocalSearchParams } from 'expo-router';



const bible = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();
  return (
    <WebsiteScreen url={url} title={title} />
  )
}

export default bible






