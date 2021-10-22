import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonInterface } from "../interfaces";
import API from "./ApiConstants";
import { getToken } from "./ApiHelper";

export class PersonHelper {
  private static person: PersonInterface;

  static async getPerson(): Promise<PersonInterface> {
    if (PersonHelper.person) return PersonHelper.person;

    const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
    const token = await getToken("MembershipApi")
    const person = await axios.get(API.MEMBER_URL + "/" + JSON.parse(churchvalue || "").personId, { headers: { "Authorization" : `Bearer ${token}` } }) 
    return person.data
  }
}