import { WebsiteScreen } from '@/src/components/exports';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const lessons = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  return (
    <WebsiteScreen url={url} title={title} />
  )
}

export default lessons
