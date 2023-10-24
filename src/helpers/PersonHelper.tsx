import { EnvironmentHelper } from "./EnvironmentHelper";
import { PersonInterface } from "@churchapps/mobilehelper";

export class PersonHelper {
  static getPhotoUrl(person: PersonInterface) {
    if (!person?.photo) return null;
    else
      return person?.photo?.startsWith("data:image/png;base64,")
        ? person.photo
        : EnvironmentHelper.ContentRoot + person.photo;
  }
}
