export const LOAD_ATTENDANCE_FETCH = 'LOAD_ATTENDANCE_FETCH';
export const LOAD_ATTENDANCE_FETCH_SUCCESS = 'LOAD_ATTENDANCE_FETCH_SUCCESS';
export const LOAD_ATTENDANCE_FETCH_FAILURE = 'LOAD_ATTENDANCE_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    load_attendance: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case LOAD_ATTENDANCE_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case LOAD_ATTENDANCE_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                load_attendance: action.data
            }
        case LOAD_ATTENDANCE_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error,
                load_attendance: null
            }

        default:
            return state;
    }
}