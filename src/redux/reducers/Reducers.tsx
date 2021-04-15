import { combineReducers } from "redux";

import SearchList from './searchListReducers';
import DrawerList from './drawerItemsReducers';
import LoginData from './loginReducers';
import MemberData from './memberDataReducer';
import HouseholdList from './householdListReducers';

const Reducers = combineReducers({
    searchlist: SearchList,
    drawerlist: DrawerList,
    login_data: LoginData,
    member_data: MemberData,
    Household_list: HouseholdList
})

export default Reducers;