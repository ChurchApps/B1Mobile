import { WebsiteScreen } from '@/src/components/exports';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const WebsiteUrl = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  return (
    <WebsiteScreen url={url} title={title} />
  )
}

export default WebsiteUrl
