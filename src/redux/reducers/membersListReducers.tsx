export const MEMBERS_LIST_FETCH = 'MEMBERS_LIST_FETCH';
export const MEMBERS_LIST_FETCH_SUCCESS = 'MEMBERS_LIST_FETCH_SUCCESS';
export const MEMBERS_LIST_FETCH_FAILURE = 'MEMBERS_LIST_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    members_list: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case MEMBERS_LIST_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case MEMBERS_LIST_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                members_list: action.data
            }
        case MEMBERS_LIST_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error.message,
                members_list: null
            }

        default:
            return state;
    }
}