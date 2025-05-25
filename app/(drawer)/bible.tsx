import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { WebsiteScreen } from '../_components/exports';



const bible = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();
  return (
    <WebsiteScreen url={url} title={title} />
  )
}

export default bible






