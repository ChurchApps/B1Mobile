export const SUBMIT_ATTENDANCE_FETCH = 'SUBMIT_ATTENDANCE_FETCH';
export const SUBMIT_ATTENDANCE_FETCH_SUCCESS = 'SUBMIT_ATTENDANCE_FETCH_SUCCESS';
export const SUBMIT_ATTENDANCE_FETCH_FAILURE = 'SUBMIT_ATTENDANCE_FETCH_FAILURE';

const initialState = {
    isFetching: false,
    submit_attendance: null,
    fetchError: false,
    fetchErrorMessage: ''
}

export default (state = initialState, action: any) => {
    switch (action.type) {
        case SUBMIT_ATTENDANCE_FETCH:
            return {
                ...state,
                isFetching: true,
                fetchError: false,
                fetchErrorMessage: ''
            }
        case SUBMIT_ATTENDANCE_FETCH_SUCCESS:
            return {
                isFetching: false,
                fetchError: false,
                fetchErrorMessage: '',
                submit_attendance: action.data
            }
        case SUBMIT_ATTENDANCE_FETCH_FAILURE:
            return {
                isFetching: false,
                fetchError: true,
                fetchErrorMessage: action.error,
                submit_attendance: null
            }

        default:
            return state;
    }
}