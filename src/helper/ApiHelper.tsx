import axios from "axios";
import API from "./ApiConstants";

export function getSearchList(searchText: any, callback: any) {
    axios.get(API.SEARCH_URL + '?name=' + searchText + '&app=B1')
        .then(res => {
            callback(null, res);
        })
        .catch(err => {
            callback(err, null);
        })
}