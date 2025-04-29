import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import { WebsiteScreen } from '../components';
const url = () => {
    const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

    return (
        <WebsiteScreen url={url} title={title} />
    )
}

export default url