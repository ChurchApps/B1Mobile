import { Alert, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { EnvironmentHelper } from "./EnvironmentHelper";
import { UserHelper } from "./UserHelper";
import { LinkInterface } from "./Interfaces";
import { Permissions } from "../mobilehelper";
import { useUserStore } from "../stores/useUserStore";

export class NavigationUtils {
  static navigateToScreen(item: LinkInterface, currentChurch?: any, from?: "home" | "drawer") {
    const bibleUrl = "https://biblia.com/api/plugins/embeddedbible?layout=normal&historyButtons=false&resourcePicker=false&shareButton=false&textSizeButton=false&startingReference=Ge1.1&resourceName=nirv";
    const uc = useUserStore.getState().currentUserChurch;
    const isFromHome = from === "home";

    switch (item.linkType) {
      case "stream": {
        UserHelper.addOpenScreenEvent("StreamScreen");
        router.push({
          pathname: isFromHome ? "streamRoot" : "/(drawer)/stream",
          params: {
            url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", currentChurch?.subDomain || "") + "/stream",
            title: item.text
          }
        });
        break;
      }
      case "lessons": {
        const jwt = uc?.jwt;
        router.push({
          pathname: isFromHome ? "lessonRoot" : "/(drawer)/lessons",
          params: {
            url: EnvironmentHelper.LessonsRoot + "/login?jwt=" + jwt + "&returnUrl=/b1/person&churchId=" + currentChurch?.id,
            title: item.text
          }
        });
        break;
      }
      case "bible": {
        UserHelper.addOpenScreenEvent("BibleScreen");
        router.push({
          pathname: isFromHome ? "bibleRoot" : "/(drawer)/bible",
          params: { url: bibleUrl, title: item.text }
        });
        break;
      }
      case "plans": {
        UserHelper.addOpenScreenEvent("PlanScreen");
        router.push(isFromHome ? "planRoot" : "/(drawer)/plan");
        break;
      }
      case "votd": {
        UserHelper.addOpenScreenEvent("VotdScreen");
        router.push(isFromHome ? "votdRoot" : "/(drawer)/votd");
        break;
      }
      case "donation": {
        this.handleDonationNavigation(isFromHome, currentChurch);
        break;
      }
      case "url": {
        UserHelper.addOpenScreenEvent("WebsiteScreen");
        router.push({
          pathname: isFromHome ? "websiteUrlRoot" : "/(drawer)/websiteUrl",
          params: { url: item.url, title: item.text }
        });
        break;
      }
      case "page": {
        UserHelper.addOpenScreenEvent("PageScreen");
        router.push({
          pathname: isFromHome ? "pageRoot" : "/(drawer)/page",
          params: { url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", currentChurch?.subDomain || "") + item.url, title: item.text }
        });
        break;
      }
      case "directory": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else if (!UserHelper.checkAccess(Permissions.membershipApi.people.viewMembers) && uc?.person.membershipStatus !== "Member" && uc?.person.membershipStatus !== "Staff") {
          Alert.alert("Alert", "Your account does not have permission to view the member directory. Please contact your church staff to request access.");
        } else {
          UserHelper.addOpenScreenEvent("MembersSearch");
          router.push(isFromHome ? "membersSearchRoot" : "/(drawer)/membersSearch");
        }
        break;
      }
      case "checkin": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("ServiceScreen");
          router.push(isFromHome ? "serviceRoot" : "/(drawer)/service");
        }
        break;
      }
      case "groups": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("MyGroups");
          router.push(isFromHome ? "/myGroupsRoot" : "/(drawer)/myGroups");
        }
        break;
      }
      case "sermons": {
        UserHelper.addOpenScreenEvent("SermonsScreen");
        router.push(isFromHome ? "/sermonsRoot" : "/(drawer)/sermons");
        break;
      }
    }
  }

  private static handleDonationNavigation(isFromHome: boolean, currentChurch?: any) {
    UserHelper.addOpenScreenEvent("DonationScreen");
    const uc = useUserStore.getState().currentUserChurch;

    if (Platform.OS === "ios") {
      let url = "https://" + currentChurch?.subDomain + ".b1.church/login/?returnUrl=%2Fdonate";
      if (uc?.jwt) {
        url += "&jwt=" + uc.jwt;
      }
      Linking.openURL(url);
    } else {
      router.push(isFromHome ? "donationRoot" : "/(drawer)/donation");
    }
  }
}
