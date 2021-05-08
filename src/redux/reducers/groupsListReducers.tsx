export const GROUPS_LIST_FETCH = 'GROUPS_LIST_FETCH';
export const GROUPS_LIST_FETCH_SUCCESS = 'GROUPS_LIST_FETCH_SUCCESS';
export const GROUPS_LIST_FETCH_FAILURE = 'GROUPS_LIST_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    groups_list: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case GROUPS_LIST_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case GROUPS_LIST_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                groups_list: action.data
            }
        case GROUPS_LIST_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error,
                groups_list: null
            }

        default:
            return state;
    }
}