import { combineReducers } from "redux";

import MemberData from './memberDataReducer';
import LoadAttendance from './loadAttendanceReducers';
import SubmitAttendance from './submitAttendanceReducers';

const Reducers = combineReducers({
  member_data: MemberData,
  load_attendance: LoadAttendance,
  submit_attendance: SubmitAttendance,
})

export default Reducers;