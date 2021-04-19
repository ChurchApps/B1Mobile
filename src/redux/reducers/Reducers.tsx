import { combineReducers } from "redux";

import SearchList from './searchListReducers';
import DrawerList from './drawerItemsReducers';
import LoginData from './loginReducers';
import MemberData from './memberDataReducer';
import HouseholdList from './householdListReducers';
import ServiceList from './servicesReducers';
import ServiceTime from './servicesTimeReducer';

const Reducers = combineReducers({
    searchlist: SearchList,
    drawerlist: DrawerList,
    login_data: LoginData,
    member_data: MemberData,
    household_list: HouseholdList,
    services_data: ServiceList,
    services_time: ServiceTime
})

export default Reducers;