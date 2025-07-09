import { DeviceEventEmitter } from "react-native";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";

export class ErrorHelper {
  static logEvent(source?: string, message?: any) {
    if (__DEV__) {
      if (source && message) {
        console.log(`[EVENT] ${source}:`, message);
      } else if (source) {
        console.log(`[EVENT] ${source}`);
      } else {
        console.log("[EVENT] Unhandled event");
      }
    }
    // Analytics.trackEvent(eventType, { source, message })
  }

  static logError(source?: string, message?: any) {
    if (__DEV__) {
      if (source && message) {
        console.log(`[ERROR] ${source}:`, message);
      } else if (source) {
        console.log(`[ERROR] ${source}`);
      } else {
        console.log("[ERROR] Unhandled error");
      }
    }
    // Analytics.trackEvent("Error", { source, message })
  }

  static onJavaError() {
    // ErrorHelper.logError(event.source, event.message);
  }

  static onJavaEvent() {
    ErrorHelper.logEvent();
  }

  static init() {
    ErrorHelper.initJava();
    ErrorHelper.initUnhandled();
  }

  static initJava() {
    DeviceEventEmitter.addListener("onError", ErrorHelper.onJavaError);
    DeviceEventEmitter.addListener("onEvent", ErrorHelper.onJavaEvent);
  }

  static initUnhandled() {
    setJSExceptionHandler(() => {
      ErrorHelper.logError();
    });

    setNativeExceptionHandler(
      () => {
        ErrorHelper.logError();
      },
      false,
      true
    );
  }
}
