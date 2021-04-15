export const MEMBER_DATA_FETCH = 'MEMBER_DATA_FETCH';
export const MEMBER_DATA_FETCH_SUCCESS = 'MEMBER_DATA_FETCH_SUCCESS';
export const MEMBER_DATA_FETCH_FAILURE = 'MEMBER_DATA_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    member_data: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case MEMBER_DATA_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case MEMBER_DATA_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                member_data: action.data
            }
        case MEMBER_DATA_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error.message,
                member_data: null
            }

        default:
            return state;
    }
}