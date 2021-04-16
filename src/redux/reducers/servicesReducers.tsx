export const SERVICES_DATA_FETCH = 'SERVICES_DATA_FETCH';
export const SERVICES_DATA_FETCH_SUCCESS = 'SERVICES_DATA_FETCH_SUCCESS';
export const SERVICES_DATA_FETCH_FAILURE = 'SERVICES_DATA_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    services_data: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case SERVICES_DATA_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case SERVICES_DATA_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                services_data: action.data
            }
        case SERVICES_DATA_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error.message,
                services_data: null
            }

        default:
            return state;
    }
}