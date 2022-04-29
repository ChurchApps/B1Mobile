import { Alert } from "react-native";
import { Permissions } from "../interfaces";
import { EnvironmentHelper } from "./EnvironmentHelper";
import { LinkInterface } from "./Interfaces";
import { UserHelper } from "./UserHelper";

export class NavigationHelper {

  static navigateToScreen = (item: LinkInterface, navigate: any) => {
    const bibleUrl = "https://biblia.com/api/plugins/embeddedbible?layout=normal&historyButtons=false&resourcePicker=false&shareButton=false&textSizeButton=false&startingReference=Ge1.1&resourceName=nirv";
    if (item.linkType == "stream") navigate('StreamScreen', { url: EnvironmentHelper.StreamingLiveRoot.replace("{subdomain}", UserHelper.currentChurch?.subDomain || ""), title: item.text })
    if (item.linkType == "lessons") navigate('LessonsScreen', { url: EnvironmentHelper.LessonsRoot + "/b1/" + UserHelper.currentChurch?.id, title: item.text })
    if (item.linkType == "bible") navigate('BibleScreen', { url: bibleUrl, title: item.text })
    if (item.linkType == "donation") navigate('DonationScreen')
    if (item.linkType == "url") navigate('WebsiteScreen', { url: item.url, title: item.text })
    if (item.linkType == "page") navigate('PageScreen', { url: item.url, title: item.text })
    if (item.linkType == "directory") {
      if (!UserHelper.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else if (!UserHelper.checkAccess(Permissions.membershipApi.people.viewMembers)) Alert.alert("Alert", "Your account does not have permission to view the member directory.  Please contact your church staff to request access.")
      else navigate('MembersSearch')
    }
    if (item.linkType == "checkin") {
      if (!UserHelper.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else navigate('ServiceScreen', {})
    }
  }

}