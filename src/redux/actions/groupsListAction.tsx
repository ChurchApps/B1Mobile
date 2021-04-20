import axios from "axios";
import API from "../../helper/ApiConstants";
import { GROUPS_LIST_FETCH, GROUPS_LIST_FETCH_FAILURE, GROUPS_LIST_FETCH_SUCCESS } from "../reducers/groupsListReducers";

export function getGroupList(token: any, callback: any) {
    return (dispatch:any) => {
        dispatch({
            type: GROUPS_LIST_FETCH
        });

        axios.get(API.GROUPS_URL, { headers: {"Authorization" : `Bearer ${token}`} })
            .then(res => {
                dispatch({
                    type: GROUPS_LIST_FETCH_SUCCESS,
                    data: res
                })
                callback(null, res);
            })
            .catch(err => {
                dispatch({
                    type: GROUPS_LIST_FETCH_FAILURE
                })
                callback(err, null);
            })
    }
}
