import { Alert, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { EnvironmentHelper } from "./EnvironmentHelper";
import { UserHelper } from "./UserHelper";
import { LinkInterface } from "./Interfaces";
import { Permissions } from "../mobilehelper";
import { useUserStore } from "../stores/useUserStore";

export class NavigationUtils {
  static navigateToScreen(item: LinkInterface, currentChurch?: any) {
    const bibleUrl = "https://biblia.com/api/plugins/embeddedbible?layout=normal&historyButtons=false&resourcePicker=false&shareButton=false&textSizeButton=false&startingReference=Ge1.1&resourceName=nirv";
    const uc = useUserStore.getState().currentUserChurch;

    switch (item.linkType) {
      case "stream": {
        UserHelper.addOpenScreenEvent("StreamScreen");
        router.push({
          pathname: "/(drawer)/stream",
          params: {
            url: EnvironmentHelper.StreamingLiveRoot.replace("{subdomain}", currentChurch?.subDomain || ""),
            title: item.text
          }
        });
        break;
      }
      case "lessons": {
        const jwt = uc?.jwt;
        router.push({
          pathname: "/(drawer)/lessons",
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
          pathname: "/(drawer)/bible",
          params: { url: bibleUrl, title: item.text }
        });
        break;
      }
      case "plans": {
        UserHelper.addOpenScreenEvent("PlanScreen");
        router.push("/(drawer)/plan");
        break;
      }
      case "votd": {
        UserHelper.addOpenScreenEvent("VotdScreen");
        router.push("/(drawer)/votd");
        break;
      }
      case "donation": {
        this.handleDonationNavigation(currentChurch);
        break;
      }
      case "url": {
        UserHelper.addOpenScreenEvent("WebsiteScreen");
        router.push({
          pathname: "/(drawer)/websiteUrl",
          params: { url: item.url, title: item.text }
        });
        break;
      }
      case "page": {
        UserHelper.addOpenScreenEvent("PageScreen");
        router.push({
          pathname: "/(drawer)/page",
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
          router.push("/(drawer)/membersSearch");
        }
        break;
      }
      case "checkin": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("ServiceScreen");
          router.push("/(drawer)/service");
        }
        break;
      }
      case "groups": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("MyGroups");
          router.push("/(drawer)/myGroups");
        }
        break;
      }
      case "sermons": {
        UserHelper.addOpenScreenEvent("SermonsScreen");
        router.push("/(drawer)/sermons");
        break;
      }
    }
  }

  private static handleDonationNavigation(currentChurch?: any) {
    UserHelper.addOpenScreenEvent("DonationScreen");
    const uc = useUserStore.getState().currentUserChurch;

    if (Platform.OS === "ios") {
      let url = "https://" + currentChurch?.subDomain + ".b1.church/login/?returnUrl=%2Fdonate";
      if (uc?.jwt) {
        url += "&jwt=" + uc.jwt;
      }
      Linking.openURL(url);
    } else {
      router.push("/(drawer)/donation");
    }
  }
}
