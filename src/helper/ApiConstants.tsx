export const ACCESS_DOMAIN_URL = 'https://accessapi.staging.churchapps.org/';
export const B1_DOMAIN_URL = 'https://api.staging.b1.church/';
export const MEMBER_DOMAIN_URL = 'https://membershipapi.staging.churchapps.org/';
export const SERVICE_DOMAIN_URL = 'https://attendanceapi.staging.churchapps.org/';
export const IMAGE_URL = 'https://content.staging.churchapps.org';

const API = {
    SEARCH_URL : ACCESS_DOMAIN_URL + 'churches/search/',
    DRAWER_LIST_URL : B1_DOMAIN_URL + 'links/church/',
    LOGIN_URL: ACCESS_DOMAIN_URL + 'users/login',
    MEMBER_URL: MEMBER_DOMAIN_URL + 'people/userId/',
    HOUSEHOLD_LIST_URL: MEMBER_DOMAIN_URL + 'people/household/',
    SERVICES_URL: SERVICE_DOMAIN_URL + 'services',
    SERVICES_TIME_URL: SERVICE_DOMAIN_URL + 'servicetimes',
    GROUPS_URL: MEMBER_DOMAIN_URL + 'groups'
}

export default API;
