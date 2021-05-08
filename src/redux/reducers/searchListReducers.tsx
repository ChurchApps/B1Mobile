export const SEARCH_LIST_FETCH = 'SEARCH_LIST_FETCH';
export const SEARCH_LIST_FETCH_SUCCESS = 'SEARCH_LIST_FETCH_SUCCESS';
export const SEARCH_LIST_FETCH_FAILURE = 'SEARCH_LIST_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    search_list: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action:any) => {
        switch (action.type) {
            case SEARCH_LIST_FETCH: 
                return {
                    ...state,
                    isFetching: true,
                    fetchError: false,
                    fetchErrorMessage: ''
                }
            case SEARCH_LIST_FETCH_SUCCESS: 
                return {
                    isFetching: false,
                    fetchError: false,
                    fetchErrorMessage: '',
                    search_list: action.data
                }
            case SEARCH_LIST_FETCH_FAILURE:
                return {
                    isFetching: false,
                    fetchError: true,
                    fetchErrorMessage: action.error.message,
                    search_list: null
                }
           
            default: 
                return state;
        }
    }
    
    