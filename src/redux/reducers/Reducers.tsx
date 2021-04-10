import { combineReducers } from "redux";

import SearchList from './searchListReducers';
import DrawerList from './drawerItemsReducers';
import LoginData from './loginReducers';

const Reducers = combineReducers({
    searchlist: SearchList,
    drawerlist: DrawerList,
    login_data: LoginData,
})

export default Reducers;