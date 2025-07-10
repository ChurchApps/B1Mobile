// import RNDI from 'react-native-device-info';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNDI from "expo-device";
import Constants from "expo-constants";
import * as Application from "expo-application";

export interface DeviceInfoInterface {
  appName?: string;
  deviceName?: string;
  buildId?: string;
  buildNumber?: string;
  brand?: string;
  device?: string;
  deviceId?: string;
  deviceType?: RNDI.DeviceType;
  hardware?: string;
  manufacturer?: string;
  version?: string;
}

export class DeviceInfo {
  private static current: DeviceInfoInterface | null = null;

  static async getDeviceInfo(): Promise<DeviceInfoInterface> {
    if (this.current === null) {
      const details: DeviceInfoInterface = {};

      details.appName = Constants.manifest?.name ?? "Unknown";
      details.deviceName = RNDI.deviceName ?? "Unknown";
      details.buildId = Constants.nativeBuildVersion ?? "Unknown";
      details.buildNumber = Constants.manifest?.version ?? "Unknown";
      details.brand = RNDI.brand ?? "Unknown";
      details.device = RNDI.modelName ?? "Unknown";
      details.deviceId = await AsyncStorage.getItem("deviceId");

      if (!details.deviceId) {
        details.deviceId = (await Application.getAndroidId()) ?? "Unknown";
        await AsyncStorage.setItem("deviceId", details.deviceId);
      }

      details.deviceType = RNDI.deviceType ?? RNDI.DeviceType.UNKNOWN;
      details.hardware = "Unknown";
      details.manufacturer = RNDI.manufacturer ?? "Unknown";
      details.version = Constants.expoVersion ?? "Unknown";
      this.current = details;
    }

    return this.current;
  }
}
