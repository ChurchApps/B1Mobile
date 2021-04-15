export const ACCESS_DOMAIN_URL = 'https://accessapi.staging.churchapps.org/';
export const B1_DOMAIN_URL = 'https://api.staging.b1.church/';
export const MEMBER_DOMAIN_URL = 'https://membershipapi.staging.churchapps.org/'

const API = {
    SEARCH_URL : ACCESS_DOMAIN_URL + 'churches/search/',
    DRAWER_LIST_URL : B1_DOMAIN_URL + 'links/church/',
    LOGIN_URL: ACCESS_DOMAIN_URL + 'users/login',
    MEMBER_URL: MEMBER_DOMAIN_URL + 'people/userId/',
    HOUSEHOLD_LIST_URL: MEMBER_DOMAIN_URL + 'people/household/'
}

export default API;
