import { View, Text } from 'react-native'
import React from 'react'
import { WebsiteScreen } from '../components'
import { useLocalSearchParams } from 'expo-router';

const lessons = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  return (
    <WebsiteScreen url={url} title={title} />
  )
}

export default lessons