import { requireOptionalNativeModule } from "expo";

type YouVersionModule = typeof import("@youversion/platform-react-native");

let cachedModule: YouVersionModule | null | undefined;

export const getYouVersionModule = (): YouVersionModule | null => {
  if (cachedModule !== undefined) return cachedModule;

  const nativeModule = requireOptionalNativeModule("RNYouVersionPlatform");
  if (!nativeModule) {
    cachedModule = null;
    return cachedModule;
  }

  try {
    cachedModule = require("@youversion/platform-react-native") as YouVersionModule;
  } catch (error) {
    console.warn("[YouVersion] Failed to load JS module after native module check.", error);
    cachedModule = null;
  }

  return cachedModule;
};
