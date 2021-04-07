import { combineReducers } from "redux";

import SearchList from './searchListReducers';
import DrawerList from './drawerItemsReducers';

const Reducers = combineReducers({
    searchlist: SearchList,
    drawerlist: DrawerList,
})

export default Reducers;