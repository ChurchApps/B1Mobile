export const SERVICES_TIME_FETCH = 'SERVICES_TIME_FETCH';
export const SERVICES_TIME_FETCH_SUCCESS = 'SERVICES_TIME_FETCH_SUCCESS';
export const SERVICES_TIME_FETCH_FAILURE = 'SERVICES_TIME_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    services_time: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case SERVICES_TIME_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case SERVICES_TIME_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                services_time: action.data
            }
        case SERVICES_TIME_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error,
                services_time: null
            }

        default:
            return state;
    }
}