export const DRAWER_LIST_FETCH = 'DRAWER_LIST_FETCH';
export const DRAWER_LIST_FETCH_SUCCESS = 'DRAWER_LIST_FETCH_SUCCESS';
export const DRAWER_LIST_FETCH_FAILURE = 'DRAWER_LIST_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    drawer_list: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action:any) => {
        switch (action.type) {
            case DRAWER_LIST_FETCH: 
                return {
                    ...state,
                    isFetching: true,
                    fetchError: false,
                    fetchErrorMessage: ''
                }
            case DRAWER_LIST_FETCH_SUCCESS: 
                return {
                    isFetching: false,
                    fetchError: false,
                    fetchErrorMessage: '',
                    drawer_list: action.drawer_list
                }
            case DRAWER_LIST_FETCH_FAILURE:
                return {
                    isFetching: false,
                    fetchError: true,
                    fetchErrorMessage: action.error.message,
                    drawer_list: null
                }
           
            default: 
                return state;
        }
    }
    
    