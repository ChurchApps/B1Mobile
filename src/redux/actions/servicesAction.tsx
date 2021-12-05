import axios from "axios";
import API from "../../helpers/ApiConstants";
import { SERVICES_DATA_FETCH, SERVICES_DATA_FETCH_FAILURE, SERVICES_DATA_FETCH_SUCCESS } from "../reducers/servicesReducers";

export function getServicesData(token: any, callback: any) {
  return (dispatch: any) => {
    dispatch({
      type: SERVICES_DATA_FETCH
    });

    axios.get(API.SERVICES_URL, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => {
        dispatch({
          type: SERVICES_DATA_FETCH_SUCCESS,
          data: res
        })
        callback(null, res);
      })
      .catch(err => {
        dispatch({
          type: SERVICES_DATA_FETCH_FAILURE
        })
        callback(err, null);
      })
  }
}
