import axios from "axios";
import API from "../../helpers/ApiConstants";
import { SEARCH_LIST_FETCH, SEARCH_LIST_FETCH_FAILURE, SEARCH_LIST_FETCH_SUCCESS } from "../reducers/searchListReducers";

export function getSearchList(searchText: any, callback: any) {
  return (dispatch: any) => {
    dispatch({
      type: SEARCH_LIST_FETCH
    });

    axios.get(API.SEARCH_URL + '?name=' + searchText + '&app=B1&include=logoSquare')
      .then(res => {
        dispatch({
          type: SEARCH_LIST_FETCH_SUCCESS,
          data: res
        })
        callback(null, res);
      })
      .catch(err => {
        dispatch({
          type: SEARCH_LIST_FETCH_FAILURE
        })
        callback(err, null);
      })
  }
}
