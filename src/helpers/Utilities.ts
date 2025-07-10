import { CacheHelper } from "./CacheHelper";

export class Utilities {
  static trackEvent(name: string, data?: Record<string, unknown>) {
    let pkg = require("../../package.json");

    const props = data ? data : {};
    props.church = CacheHelper.church?.name || "";
    // props.church = UserHelper.user?.displayName; // Legacy - now using UserHelper.addOpenScreenEvent
    props.appVersion = pkg.version;
    // Analytics.trackEvent(name, props);
  }
}
