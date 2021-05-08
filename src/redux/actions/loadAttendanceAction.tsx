import axios from "axios";
import API from "../../helper/ApiConstants";
import { LOAD_ATTENDANCE_FETCH, LOAD_ATTENDANCE_FETCH_SUCCESS, LOAD_ATTENDANCE_FETCH_FAILURE } from "../reducers/loadAttendanceReducers";

export function loadAttendanceData(serviceId: any, peopleIds: any, token: any, callback: any) {
    return (dispatch:any) => {
        dispatch({
            type: LOAD_ATTENDANCE_FETCH
        });
        axios.get(API.ATTENDANCE_URL + '?serviceId=' + serviceId + '&peopleIds=' + peopleIds + '&include=visitSessions', { headers: {"Authorization" : `Bearer ${token}`} })
            .then(res => {
                dispatch({
                    type: LOAD_ATTENDANCE_FETCH_SUCCESS,
                    data: res
                })
                callback(null, res);
            })
            .catch(err => {
                dispatch({
                    type: LOAD_ATTENDANCE_FETCH_FAILURE
                })
                callback(err, null);
            })
    }
}
