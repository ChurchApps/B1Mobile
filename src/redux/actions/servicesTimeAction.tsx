import axios from "axios";
import API from "../../helpers/ApiConstants";
import { SERVICES_TIME_FETCH, SERVICES_TIME_FETCH_FAILURE, SERVICES_TIME_FETCH_SUCCESS } from "../reducers/servicesTimeReducer";

export function getServicesTimeData(serviceId: any, token: any, callback: any) {
  return (dispatch: any) => {
    dispatch({
      type: SERVICES_TIME_FETCH
    });

    axios.get(API.SERVICES_TIME_URL + '?serviceId=' + serviceId, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => {
        dispatch({
          type: SERVICES_TIME_FETCH_SUCCESS,
          data: res
        })
        callback(null, res);
      })
      .catch(err => {
        dispatch({
          type: SERVICES_TIME_FETCH_FAILURE
        })
        callback(err, null);
      })
  }
}
