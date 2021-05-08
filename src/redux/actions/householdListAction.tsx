import axios from "axios";
import API from "../../helper/ApiConstants";
import { HOUSEHOLD_LIST_FETCH, HOUSEHOLD_LIST_FETCH_FAILURE, HOUSEHOLD_LIST_FETCH_SUCCESS } from "../reducers/householdListReducers";

export function getHouseholdList(householdId: any, token: any, callback: any) {
    return (dispatch:any) => {
        dispatch({
            type: HOUSEHOLD_LIST_FETCH
        });

        axios.get(API.HOUSEHOLD_LIST_URL + householdId, { headers: {"Authorization" : `Bearer ${token}`} }) 
            .then(res => {
                dispatch({
                    type: HOUSEHOLD_LIST_FETCH_SUCCESS,
                    data: res
                })
                callback(null, res);
            })
            .catch(err => {
                dispatch({
                    type: HOUSEHOLD_LIST_FETCH_FAILURE
                })
                callback(err, null);
            })
    }
}
