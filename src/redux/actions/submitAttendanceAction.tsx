import axios from "axios";
import API from "../../helper/ApiConstants";
import { SUBMIT_ATTENDANCE_FETCH, SUBMIT_ATTENDANCE_FETCH_SUCCESS, SUBMIT_ATTENDANCE_FETCH_FAILURE } from "../reducers/submitAttendanceReducers";

export function submitAttendanceData(serviceId: any, peopleIds: any, token: any, callback: any) {
    return (dispatch:any) => {
        dispatch({
            type: SUBMIT_ATTENDANCE_FETCH
        });
        axios.post(API.ATTENDANCE_URL + '?serviceId=' + serviceId + '&peopleIds=' + peopleIds, { headers: {"Authorization" : `Bearer ${token}`} })
            .then(res => {
                dispatch({
                    type: SUBMIT_ATTENDANCE_FETCH_SUCCESS,
                    data: res
                })
                callback(null, res);
            })
            .catch(err => {
                dispatch({
                    type: SUBMIT_ATTENDANCE_FETCH_FAILURE
                })
                callback(err, null);
            })
    }
}