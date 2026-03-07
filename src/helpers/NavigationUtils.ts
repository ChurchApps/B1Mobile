import { Alert, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { EnvironmentHelper } from "./EnvironmentHelper";
import { UserHelper } from "./UserHelper";
import { ChurchInterface, LinkInterface } from "./Interfaces";
import { Permissions } from "@churchapps/helpers";
import { useUserStore } from "../stores/useUserStore";

export class NavigationUtils {
  static navigateToScreen(item: LinkInterface, currentChurch?: ChurchInterface) {
    const uc = useUserStore.getState().currentUserChurch;

    switch (item.linkType) {
      case "stream": {
        UserHelper.addOpenScreenEvent("StreamScreen");
        router.push({ pathname: "/streamRoot", params: { url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", currentChurch?.subDomain || "") + "/stream", title: item.text } });
        break;
      }
      case "lessons": {
        const jwt = uc?.jwt;
        router.push({ pathname: "/lessonRoot", params: { url: EnvironmentHelper.LessonsRoot + "/login?jwt=" + jwt + "&returnUrl=/b1/person&churchId=" + currentChurch?.id, title: item.text } });
        break;
      }
      case "bible": {
        UserHelper.addOpenScreenEvent("BibleScreen");
        router.push("/bibleRoot");
        break;
      }
      case "plans": {
        UserHelper.addOpenScreenEvent("PlanScreen");
        router.push("/planRoot");
        break;
      }
      case "votd": {
        UserHelper.addOpenScreenEvent("VotdScreen");
        router.push("/votdRoot");
        break;
      }
      case "donation": {
        this.handleDonationNavigation(currentChurch);
        break;
      }
      case "url": {
        UserHelper.addOpenScreenEvent("WebsiteScreen");
        router.push({ pathname: "/websiteUrlRoot", params: { url: item.url, title: item.text } });
        break;
      }
      case "page": {
        UserHelper.addOpenScreenEvent("PageScreen");
        router.push({ pathname: "/pageRoot", params: { url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", currentChurch?.subDomain || "") + item.url, title: item.text } });
        break;
      }
      case "directory": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else if (!UserHelper.checkAccess(Permissions.membershipApi.people.viewMembers) && uc?.person.membershipStatus !== "Member" && uc?.person.membershipStatus !== "Staff") {
          Alert.alert("Alert", "Your account does not have permission to view the member directory. Please contact your church staff to request access.");
        } else {
          UserHelper.addOpenScreenEvent("MembersSearch");
          router.push("/membersSearchRoot");
        }
        break;
      }
      case "checkin": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("ServiceScreen");
          router.push("/serviceRoot");
        }
        break;
      }
      case "groups": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("MyGroups");
          router.push("/myGroupsRoot");
        }
        break;
      }
      case "sermons": {
        UserHelper.addOpenScreenEvent("SermonsScreen");
        router.push("/sermonsRoot");
        break;
      }
      case "volunteer": {
        UserHelper.addOpenScreenEvent("VolunteerBrowse");
        router.push("/volunteerBrowseRoot");
        break;
      }
      case "registrations": {
        if (!uc?.person?.id) {
          Alert.alert("Alert", "You must be logged in to access this page.");
        } else {
          UserHelper.addOpenScreenEvent("RegistrationsScreen");
          router.push("/registrationsRoot");
        }
        break;
      }
    }
  }

  private static handleDonationNavigation(currentChurch?: ChurchInterface) {
    UserHelper.addOpenScreenEvent("DonationScreen");
    const uc = useUserStore.getState().currentUserChurch;

    if (Platform.OS === "ios") {
      let url = "https://" + currentChurch?.subDomain + ".b1.church/login/?returnUrl=%2Fdonate";
      if (uc?.jwt) {
        url += "&jwt=" + uc.jwt;
      }
      Linking.openURL(url);
    } else {
      router.push("/donationRoot");
    }
  }
}
