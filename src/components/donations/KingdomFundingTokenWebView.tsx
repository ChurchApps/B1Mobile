import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { WebView } from "react-native-webview";

export interface KFTokenResult {
  nonce: string;
  last4: string;
  cardType: string;
  expiryMonth: string;
  expiryYear: string;
  maskedCard: string;
}

export interface KFTokenWebViewHandle {
  getNonce: () => Promise<KFTokenResult>;
}

interface Props {
  tokenizationKey: string;
  sandbox?: boolean;
}

/**
 * WebView-based KingdomFunding hosted tokenization for React Native.
 * Loads the tokenization script in a WebView and exposes a getNonce() method.
 */
export const KingdomFundingTokenWebView = forwardRef<KFTokenWebViewHandle, Props>(
  ({ tokenizationKey, sandbox = false }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [isReady, setIsReady] = useState(false);
    const resolveRef = useRef<((value: KFTokenResult) => void) | null>(null);
    const rejectRef = useRef<((reason: any) => void) | null>(null);

    const scriptUrl = sandbox
      ? "https://tokenization.sandbox.accept.blue/tokenization/v0.3"
      : "https://tokenization.accept.blue/tokenization/v0.3";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; }
          #tokenization-container { width: 100%; min-height: 200px; }
          #tokenization-container iframe { border: none !important; }
        </style>
      </head>
      <body>
        <div id="tokenization-container"></div>
        <script src="${scriptUrl}"></script>
        <script>
          var hostedTokenization = null;
          try {
            hostedTokenization = new HostedTokenization('${tokenizationKey}', { target: '#tokenization-container' });
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
          }

          window.getNonce = function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: 'getNonce called, hostedTokenization=' + !!hostedTokenization }));
            if (!hostedTokenization) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'nonce_error', message: 'Tokenization not initialized' }));
              return;
            }
            try {
              var promise = hostedTokenization.getNonceToken();
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: 'getNonceToken() returned: ' + typeof promise }));
              promise.then(function(result) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'nonce_result',
                  nonce: result.nonce,
                  last4: result.last4,
                  cardType: result.cardType,
                  expiryMonth: result.expiryMonth,
                  expiryYear: result.expiryYear,
                  maskedCard: result.maskedCard
                }));
              }).catch(function(err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'nonce_error', message: err.message || 'Failed to get nonce' }));
              });
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'nonce_error', message: 'getNonceToken threw: ' + e.message }));
            }
          };
        </script>
      </body>
      </html>
    `;

    useImperativeHandle(ref, () => ({
      getNonce: () => {
        return new Promise<KFTokenResult>((resolve, reject) => {
          console.log("[KFWebView] getNonce called, isReady:", isReady);
          if (!isReady) {
            reject(new Error("Tokenization form not ready"));
            return;
          }
          const timeout = setTimeout(() => {
            console.log("[KFWebView] getNonce TIMED OUT after 15s");
            resolveRef.current = null;
            rejectRef.current = null;
            reject(new Error("Tokenization timed out. Please check your card details and try again."));
          }, 15000);
          resolveRef.current = (result) => { clearTimeout(timeout); resolve(result); };
          rejectRef.current = (reason) => { clearTimeout(timeout); reject(reason); };
          webViewRef.current?.injectJavaScript("window.getNonce(); true;");
        });
      }
    }));

    const onMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case "ready":
            setIsReady(true);
            break;
          case "nonce_result":
            if (resolveRef.current) {
              resolveRef.current({
                nonce: data.nonce,
                last4: data.last4,
                cardType: data.cardType,
                expiryMonth: data.expiryMonth,
                expiryYear: data.expiryYear,
                maskedCard: data.maskedCard
              });
              resolveRef.current = null;
              rejectRef.current = null;
            }
            break;
          case "nonce_error":
            if (rejectRef.current) {
              rejectRef.current(new Error(data.message));
              resolveRef.current = null;
              rejectRef.current = null;
            }
            break;
          case "debug":
            console.log("[KFWebView] debug:", data.message);
            break;
          case "error":
            console.error("KingdomFunding tokenization error:", data.message);
            break;
        }
      } catch (e) {
        console.error("Failed to parse WebView message:", e);
      }
    };

    return (
      <View style={styles.container}>
        {!isReady && (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#0D47A1" />
            <Text variant="bodySmall" style={styles.loadingText}>Loading secure payment form...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent, baseUrl: sandbox ? "https://tokenization.sandbox.accept.blue" : "https://tokenization.accept.blue" }}
          onMessage={onMessage}
          style={[styles.webView, !isReady && styles.hidden]}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          scrollEnabled={false}
          mixedContentMode="always"
          allowsInlineMediaPlayback
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    borderRadius: 8,
    overflow: "hidden"
  },
  webView: {
    height: 220,
    backgroundColor: "transparent"
  },
  hidden: {
    height: 0,
    opacity: 0
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8
  },
  loadingText: {
    color: "#9E9E9E"
  }
});
