import { EnvironmentHelper } from "./EnvironmentHelper";
import { PersonInterface } from "./Interfaces";

export class PersonHelper {
  static getPhotoUrl(person: PersonInterface) {
    // Add defensive check for null/undefined person
    if (!person || !person.photo) return null;

    try {
      return person.photo.startsWith("data:image/png;base64,") ? person.photo : EnvironmentHelper.ContentRoot + person.photo;
    } catch (error) {
      console.warn("Error generating photo URL:", error, person);
      return null;
    }
  }
}
