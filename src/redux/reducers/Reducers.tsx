import { combineReducers } from "redux";

import SearchList from './searchListReducers';
import DrawerList from './drawerItemsReducers';
import LoginData from './loginReducers';
import MemberData from './memberDataReducer';
import HouseholdList from './householdListReducers';
import ServiceList from './servicesReducers';
import ServiceTime from './servicesTimeReducer';
import GroupList from './groupsListReducers';

const Reducers = combineReducers({
    searchlist: SearchList,
    drawerlist: DrawerList,
    login_data: LoginData,
    member_data: MemberData,
    household_list: HouseholdList,
    services_data: ServiceList,
    services_time: ServiceTime,
    group_list: GroupList
})

export default Reducers;