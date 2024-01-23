import { ChurchInterface } from "@churchapps/mobilehelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserHelper } from "./UserHelper";

export class CacheHelper {
  static church: ChurchInterface | null = null;
  static recentChurches: ChurchInterface[] = [];
  static fcmToken: string = "";

  static loadFromStorage = async () => {
    const data = await AsyncStorage.multiGet(["CHURCH_DATA", "RECENT_CHURCHES", "fcmToken", "USER_DATA"]);
    data.map((item) => {
      switch (item[0]) {
        case "CHURCH_DATA": this.church = JSON.parse(item[1] || ""); break;
        case "fcmToken": this.fcmToken = item[1] || ""; break;
        case "RECENT_CHURCHES": this.recentChurches = JSON.parse(item[1] || ""); break;
        case "USER_DATA": UserHelper.user = JSON.parse(item[1] || ""); break;
      }
    });
    
  }

  static setValue = async (key: "fcmToken" | "church" | "recentChurches" | "user", value: any) => {

    switch (key) {
      case "fcmToken":
        this.fcmToken = value;
        await AsyncStorage.setItem("fcmToken", value);
        break;
      case "church":
        this.church = value;
        await AsyncStorage.setItem("CHURCH_DATA", (value===null) ? "" : JSON.stringify(value));
        break;
      case "recentChurches":
        this.recentChurches = value;
        await AsyncStorage.setItem("RECENT_CHURCHES", (value===null) ? "" : JSON.stringify(value));
        break;
      case "user":
        await AsyncStorage.setItem("USER_DATA", (value===null) ? "" : JSON.stringify(value));
        UserHelper.user = value;
        break;
    }

  }

}