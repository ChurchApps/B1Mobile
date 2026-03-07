import { useUserStore } from "../stores/useUserStore";
import pkg from "../../package.json";

export class Utilities {
  static trackEvent(name: string, data?: Record<string, unknown>) {
    const props = data ? data : {};
    props.church = useUserStore.getState().currentUserChurch?.church?.name || "";
    // props.church = UserHelper.user?.displayName; // Legacy - now using UserHelper.addOpenScreenEvent
    props.appVersion = pkg.version;
    // Analytics.trackEvent(name, props);
  }
}
