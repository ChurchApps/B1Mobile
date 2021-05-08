export const HOUSEHOLD_LIST_FETCH = 'HOUSEHOLD_LIST_FETCH';
export const HOUSEHOLD_LIST_FETCH_SUCCESS = 'HOUSEHOLD_LIST_FETCH_SUCCESS';
export const HOUSEHOLD_LIST_FETCH_FAILURE = 'HOUSEHOLD_LIST_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    household_list: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case HOUSEHOLD_LIST_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case HOUSEHOLD_LIST_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                household_list: action.data
            }
        case HOUSEHOLD_LIST_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error,
                household_list: null
            }

        default:
            return state;
    }
}