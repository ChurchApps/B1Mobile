import axios from "axios";
import API from "../../helper/ApiConstants";
import { DRAWER_LIST_FETCH, DRAWER_LIST_FETCH_FAILURE, DRAWER_LIST_FETCH_SUCCESS } from "../reducers/drawerItemsReducers";

export function getDrawerList(churchId: any, callback: any) {
    return (dispatch:any) => {
        dispatch({
            type: DRAWER_LIST_FETCH
        });

        axios.get(API.DRAWER_LIST_URL + churchId +'?category=tab')
            .then(res => {
                dispatch({
                    type: DRAWER_LIST_FETCH_SUCCESS,
                    data: res
                })
                callback(null, res);
            })
            .catch(err => {
                dispatch({
                    type: DRAWER_LIST_FETCH_FAILURE
                })
                callback(err, null);
            })
    }
}
