import { Alert, Linking, Platform } from "react-native";
import { Permissions } from "../interfaces";
import { CacheHelper } from "./CacheHelper";
import { EnvironmentHelper } from "./EnvironmentHelper";
import { LinkInterface } from "./Interfaces";
import { UserHelper } from "./UserHelper";
//import SafariView from "react-native-safari-view";

export class NavigationHelper {

  static navigateToScreen = (item: LinkInterface, navigate: any) => {
    const bibleUrl = "https://biblia.com/api/plugins/embeddedbible?layout=normal&historyButtons=false&resourcePicker=false&shareButton=false&textSizeButton=false&startingReference=Ge1.1&resourceName=nirv";
    console.log(item)
    console.log(navigate)
    if (item.linkType == "stream") {
      UserHelper.addOpenScreenEvent('StreamScreen');
      navigate({
        pathname: '/stream',
        params: {
          url: EnvironmentHelper.StreamingLiveRoot.replace("{subdomain}", CacheHelper.church!.subDomain || ""),
          title: item.text,
        },
      });
      // navigate('StreamScreen', { url: EnvironmentHelper.StreamingLiveRoot.replace("{subdomain}", CacheHelper.church!.subDomain || ""), title: item.text })
    }
    if (item.linkType == "lessons") {
      console.log("hello")
      // UserHelper.addOpenScreenEvent('LessonsScreen');
      const jwt = UserHelper.currentUserChurch?.jwt;
      console.log("***** " + EnvironmentHelper.LessonsRoot + "/login?jwt=" + jwt + "&returnUrl=/b1/person&churchId=" + CacheHelper.church!.id);
      // navigate('LessonsScreen', { url: EnvironmentHelper.LessonsRoot + "/login?jwt=" + jwt + "&returnUrl=/b1/person&churchId=" + CacheHelper.church!.id, title: item.text })
      navigate({
        pathname: '/(drawer)/lessons',
        params: {
          url: EnvironmentHelper.LessonsRoot + "/login?jwt=" + jwt + "&returnUrl=/b1/person&churchId=" + CacheHelper.church!.id,
          title: item.text
        },
      });
    }
    if (item.linkType == "bible") {
      UserHelper.addOpenScreenEvent('BibleScreen');
      // navigate('BibleScreen', { url: bibleUrl, title: item.text })
      navigate({
        pathname: '/(drawer)/bible',
        params: { url: bibleUrl, title: item.text },
      });
    }
    if (item.linkType == "plans") {
      UserHelper.addOpenScreenEvent('PlanScreen');
      // navigate('PlanScreen', {})
      navigate({
        pathname: '/(drawer)/plan',
        params: {},
      });
    }
    if (item.linkType == "votd") {
      UserHelper.addOpenScreenEvent('VotdScreen');
      // navigate('VotdScreen', {})
      navigate({
        pathname: '/(drawer)/votd',
        params: {},
      });
    }
    if (item.linkType == "donation") {
      // if (!UserHelper.currentUserChurch?.person?.id) Alert.alert("Alert", "You must be logged in to access this page.")
      // else NavigationHelper.navDonations(navigate);
      NavigationHelper.navDonations(navigate);
    }
    if (item.linkType == "url") {
      UserHelper.addOpenScreenEvent('WebsiteScreen');
      console.log("WEBSITE******* ", item.url);
      // navigate('WebsiteScreen', { url: item.url, title: item.text })
      navigate({
        pathname: '/(drawer)/websiteUrl',
        params: { url: item.url, title: item.text },
      });
    }
    if (item.linkType == "page") {
      UserHelper.addOpenScreenEvent('PageScreen');
      // navigate('PageScreen', { url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", CacheHelper.church!.subDomain || "") + item.url, title: item.text })
      navigate({
        pathname: '/(drawer)/page',
        params: { url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", CacheHelper.church!.subDomain || "") + item.url, title: item.text },
      });
    }
    if (item.linkType == "directory") {
      if (!UserHelper.currentUserChurch?.person?.id) Alert.alert("Alert", "You must be logged in to access this page.")
      else if (!UserHelper.checkAccess(Permissions.membershipApi.people.viewMembers) && UserHelper.currentUserChurch?.person.membershipStatus !== "Member" && UserHelper.currentUserChurch?.person.membershipStatus !== "Staff") Alert.alert("Alert", "Your account does not have permission to view the member directory.  Please contact your church staff to request access.")
      else {
        UserHelper.addOpenScreenEvent('MembersSearch');
        // navigate('MembersSearch')
        navigate({
          pathname: '/(drawer)/membersSearch',
        });
      }
    }
    if (item.linkType == "checkin") {
      if (!UserHelper.currentUserChurch?.person?.id) Alert.alert("Alert", "You must be logged in to access this page.")
      else {
        UserHelper.addOpenScreenEvent('ServiceScreen');
        // navigate('ServiceScreen', {})
        navigate({
          pathname: '/(drawer)/service',
          params: {},
        });
      }
    }
    if (item.linkType === 'groups') {
      if (!UserHelper.currentUserChurch?.person?.id) Alert.alert("Alert", "You must be logged in to access this page.")
      UserHelper.addOpenScreenEvent('MyGroups');
      // navigate('MyGroups')
      navigate({
        pathname: '/(drawer)/myGroups',
      });
    }
  }

  static navDonations(navigate: any) {
    UserHelper.addOpenScreenEvent('DonationScreen');
    // if (Platform.OS === "ios") {
    //   let url = "https://" + CacheHelper.church!.subDomain + ".b1.church/login/?returnUrl=%2Fdonation-landing";
    //   if (UserHelper.currentUserChurch.jwt) url += "&jwt=" + UserHelper.currentUserChurch.jwt;
    //   Linking.openURL(url);
    //   /*SafariView.isAvailable().then(() => {
    //     SafariView.show({ url: url })
    //   })*/
    // } else navigate('DonationScreen')
    if (Platform.OS === "ios") {
      let url = "https://" + CacheHelper.church!.subDomain + ".b1.church/login/?returnUrl=%2Fdonation-landing";
      const jwt = UserHelper.currentUserChurch?.jwt;
      if (jwt) {
        url += "&jwt=" + jwt;
      }
      Linking.openURL(url);
    } else {
      // navigate('DonationScreen');
      navigate({
        pathname: '/(drawer)/donation',
      });
    }
  }

}