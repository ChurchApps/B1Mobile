import { DeviceEventEmitter } from "react-native";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";

export class ErrorHelper {
  static logEvent() {
    //console.log("***************Adding new event to analytics : ",{source, message});
    // Analytics.trackEvent(eventType, { source, message })
  }

  static logError() {
    //console.log("***************Adding new error to analytics : ",{source, message});
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
