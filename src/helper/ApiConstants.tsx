export const ACCESS_DOMAIN_URL = 'https://accessapi.staging.churchapps.org/';
export const B1_DOMAIN_URL = 'https://api.staging.b1.church/';
export const MEMBER_DOMAIN_URL = 'https://membershipapi.staging.churchapps.org/';
export const ATTENDANCE_DOMAIN_URL = 'https://attendanceapi.staging.churchapps.org/';

const API = {
    IMAGE_URL : 'https://content.staging.churchapps.org',
    SEARCH_URL : ACCESS_DOMAIN_URL + 'churches/search/',
    DRAWER_LIST_URL : B1_DOMAIN_URL + 'links/church/',
    LOGIN_URL: ACCESS_DOMAIN_URL + 'users/login',
    MEMBER_URL: MEMBER_DOMAIN_URL + 'people',
    HOUSEHOLD_LIST_URL: MEMBER_DOMAIN_URL + 'people/household/',
    SERVICES_URL: ATTENDANCE_DOMAIN_URL + 'services',
    SERVICES_TIME_URL: ATTENDANCE_DOMAIN_URL + 'servicetimes',
    GROUPS_URL: MEMBER_DOMAIN_URL + 'groups',
    ATTENDANCE_URL: ATTENDANCE_DOMAIN_URL + 'visits/checkin'
}

export default API;
