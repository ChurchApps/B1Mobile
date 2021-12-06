import { combineReducers } from "redux";

import SubmitAttendance from './submitAttendanceReducers';

const Reducers = combineReducers({
  submit_attendance: SubmitAttendance,
})

export default Reducers;