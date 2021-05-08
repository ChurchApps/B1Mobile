export const LOGIN_FETCH = 'LOGIN_FETCH';
export const LOGIN_FETCH_SUCCESS = 'LOGIN_FETCH_SUCCESS';
export const LOGIN_FETCH_FAILURE = 'LOGIN_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    login_data: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case LOGIN_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case LOGIN_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                login_data: action.data.data
            }
        case LOGIN_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error,
                drawer_list: null
            }

        default:
            return state;
    }
}

