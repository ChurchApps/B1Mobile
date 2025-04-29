import React from 'react'
import WebView from 'react-native-webview'

const privacy = () => {
  return <WebView source={{ uri: 'https://churchapps.org/privacy' }} style={{ flex: 1 }} />
}

export default privacy