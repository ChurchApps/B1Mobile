
import Analytics from 'appcenter-analytics';
import { UserHelper } from './UserHelper';


export class Utilities {

  static trackEvent(name: string, data?: any) {
    var pkg = require('../../package.json');

    const props = (data) ? data : {}
    props.church = UserHelper.currentChurch?.name;
    props.church = UserHelper.user?.displayName;
    props.appVersion = pkg.version;
    Analytics.trackEvent(name, props);
  }

}