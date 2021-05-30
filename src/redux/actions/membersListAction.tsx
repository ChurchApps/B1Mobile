import axios from "axios";
import API from "../../helper/ApiConstants";
import { MEMBERS_LIST_FETCH, MEMBERS_LIST_FETCH_FAILURE, MEMBERS_LIST_FETCH_SUCCESS } from "../reducers/membersListReducers";

export function getMembersList(token: any, callback: any) {
    return (dispatch: any) => {
        dispatch({
            type: MEMBERS_LIST_FETCH
        });

        axios.get(API.MEMBER_URL, { headers: {"Authorization" : `Bearer ${token}`} })
            .then(res => {
                dispatch({
                    type: MEMBERS_LIST_FETCH_SUCCESS,
                    data: res
                })
                callback(null, res);
            })
            .catch(err => {
                dispatch({
                    type: MEMBERS_LIST_FETCH_FAILURE
                })
                callback(err, null);
            })
    }
}