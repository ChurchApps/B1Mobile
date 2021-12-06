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
  ATTENDANCE_URL: ATTENDANCE_DOMAIN_URL + 'visits/checkin',
  GIVING_API: GIVING_API
}

export default API;
