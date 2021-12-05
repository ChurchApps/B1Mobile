import axios from "axios";
import API from "../../helpers/ApiConstants";
import { MEMBER_DATA_FETCH, MEMBER_DATA_FETCH_FAILURE, MEMBER_DATA_FETCH_SUCCESS } from "../reducers/memberDataReducer";

export function getMemberData(personId: any, token: any, callback: any) {
  return (dispatch: any) => {
    dispatch({
      type: MEMBER_DATA_FETCH
    });

    axios.get(API.MEMBER_URL + '/' + personId, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => {
        dispatch({
          type: MEMBER_DATA_FETCH_SUCCESS,
          data: res
        })
        callback(null, res);
      })
      .catch(err => {
        dispatch({
          type: MEMBER_DATA_FETCH_FAILURE
        })
        callback(err, null);
      })
  }
}
