import { CacheHelper } from "./CacheHelper";
import { UserHelper } from "./UserHelper";

export class Utilities {
  static trackEvent(name: string, data?: any) {
    let pkg = require("../../package.json");

    const props = data ? data : {};
    props.church = CacheHelper.church?.name || "";
    props.church = UserHelper.user?.displayName;
    props.appVersion = pkg.version;
    // Analytics.trackEvent(name, props);
  }
}
