import React from 'react'
import WebView from 'react-native-webview'

const PrivacyPolicyScreen = () => {
  return <WebView source={{ uri: 'https://churchapps.org/privacy' }} style={{ flex: 1 }} />
}

export default PrivacyPolicyScreen