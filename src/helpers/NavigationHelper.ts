import { Alert, Linking, Platform } from "react-native";
import { Permissions } from "../interfaces";
import { EnvironmentHelper } from "./EnvironmentHelper";
import { LinkInterface } from "./Interfaces";
import { UserHelper } from "./UserHelper";
//import SafariView from "react-native-safari-view";

export class NavigationHelper {

  static navigateToScreen = (item: LinkInterface, navigate: any) => {
    const bibleUrl = "https://biblia.com/api/plugins/embeddedbible?layout=normal&historyButtons=false&resourcePicker=false&shareButton=false&textSizeButton=false&startingReference=Ge1.1&resourceName=nirv";
    if (item.linkType == "stream") {
      UserHelper.addOpenScreenEvent('StreamScreen');
      navigate('StreamScreen', { url: EnvironmentHelper.StreamingLiveRoot.replace("{subdomain}", UserHelper.currentUserChurch?.church?.subDomain || ""), title: item.text })
    }
    if (item.linkType == "lessons") {
      UserHelper.addOpenScreenEvent('LessonsScreen');
      navigate('LessonsScreen', { url: EnvironmentHelper.LessonsRoot + "/b1/" + UserHelper.currentUserChurch?.church?.id, title: item.text })
    }
    if (item.linkType == "bible") {
      UserHelper.addOpenScreenEvent('BibleScreen');
      navigate('BibleScreen', { url: bibleUrl, title: item.text })
    }
    if (item.linkType == "votd") {
      UserHelper.addOpenScreenEvent('VotdScreen');
      navigate('VotdScreen', {})
    }
    if (item.linkType == "donation") {
      if (!UserHelper.currentUserChurch?.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else NavigationHelper.navDonations(navigate);
    }
    if (item.linkType == "url") {
      UserHelper.addOpenScreenEvent('WebsiteScreen');
      navigate('WebsiteScreen', { url: item.url, title: item.text })
    }
    if (item.linkType == "page") {
      UserHelper.addOpenScreenEvent('PageScreen');
      navigate('PageScreen', { url: item.url, title: item.text })
    }
    if (item.linkType == "directory") {
      if (!UserHelper.currentUserChurch?.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else if (!UserHelper.checkAccess(Permissions.membershipApi.people.viewMembers) && UserHelper.currentUserChurch?.person.membershipStatus !== "Member" && UserHelper.currentUserChurch?.person.membershipStatus !== "Staff") Alert.alert("Alert", "Your account does not have permission to view the member directory.  Please contact your church staff to request access.")
      else {
        UserHelper.addOpenScreenEvent('MembersSearch');
        navigate('MembersSearch')
      }
    }
    if (item.linkType == "checkin") {
      if (!UserHelper.currentUserChurch?.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else {
        UserHelper.addOpenScreenEvent('ServiceScreen');
        navigate('ServiceScreen', {})
      }
    }
  }

  static navDonations(navigate: any) {    
    UserHelper.addOpenScreenEvent('DonationScreen');
    if (Platform.OS === "ios") {
      let url = "https://" + UserHelper.currentUserChurch?.church?.subDomain + ".b1.church/login/?returnUrl=%2Fdonation-landing";
      if (UserHelper.currentUserChurch.jwt) url += "&jwt=" + UserHelper.currentUserChurch.jwt;
      Linking.openURL(url);
      /*SafariView.isAvailable().then(() => {
        SafariView.show({ url: url })
      })*/
    } else navigate('DonationScreen')
  }

}