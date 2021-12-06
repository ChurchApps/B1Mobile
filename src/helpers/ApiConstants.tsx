//Staging
export const ACCESS_DOMAIN_URL = 'https://accessapi.staging.churchapps.org/';
export const B1_DOMAIN_URL = 'https://api.staging.b1.church/';
export const MEMBERSHIP_URL = 'https://membershipapi.staging.churchapps.org/';
export const ATTENDANCE_DOMAIN_URL = 'https://attendanceapi.staging.churchapps.org/';
export const GIVING_API = "https://givingapi.staging.churchapps.org"
export const CONTENT_URL = "https://content.staging.churchapps.org"

//PROD
//export const ACCESS_DOMAIN_URL = 'https://accessapi.churchapps.org/';
//export const B1_DOMAIN_URL = 'https://api.b1.church/';
//export const MEMBERSHIP_URL = 'https://membershipapi.churchapps.org/';
//export const ATTENDANCE_DOMAIN_URL = 'https://attendanceapi.churchapps.org/';
//export const GIVING_API = "https://givingapi.churchapps.org"
//export const CONTENT_URL = "https://content.churchapps.org"


//Staging
const API = {
  IMAGE_URL: CONTENT_URL,
  DRAWER_LIST_URL: B1_DOMAIN_URL + 'links/church/',
  LOGIN_URL: ACCESS_DOMAIN_URL + 'users/login',
  MEMBER_URL: MEMBERSHIP_URL + 'people',
  HOUSEHOLD_LIST_URL: MEMBERSHIP_URL + 'people/household/',
  SERVICES_URL: ATTENDANCE_DOMAIN_URL + 'services',
  SERVICES_TIME_URL: ATTENDANCE_DOMAIN_URL + 'servicetimes',
  GROUPS_URL: MEMBERSHIP_URL + 'groups',
  ATTENDANCE_URL: ATTENDANCE_DOMAIN_URL + 'visits/checkin',
  GIVING_API: GIVING_API
}

export default API;
