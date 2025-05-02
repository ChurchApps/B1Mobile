import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { WebsiteScreen } from '../components';
const websiteUrl = () => {
    const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

    return (
        <WebsiteScreen url={url} title={title} />
    )
}

export default websiteUrl