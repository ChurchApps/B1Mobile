import axios from "axios";
import API from "../../helper/ApiConstants";
import { LOGIN_FETCH, LOGIN_FETCH_FAILURE, LOGIN_FETCH_SUCCESS } from "../reducers/loginReducers";

export function getLoginData(params: any, callback: any) {
    return (dispatch:any) => {
        dispatch({
            type: LOGIN_FETCH
        });

        axios.post(API.LOGIN_URL, params)
        .then(res => {
            dispatch({
                type: LOGIN_FETCH_SUCCESS,
                data: res
            })
            callback(null, res);
        })
        .catch(err => {
            dispatch({
                type: LOGIN_FETCH_FAILURE
            })
            callback(err, null);
        })
    }
}
