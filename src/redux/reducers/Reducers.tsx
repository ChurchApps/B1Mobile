import { combineReducers } from "redux";

import MemberData from './memberDataReducer';
import GroupList from './groupsListReducers';
import LoadAttendance from './loadAttendanceReducers';
import SubmitAttendance from './submitAttendanceReducers';

const Reducers = combineReducers({
  member_data: MemberData,
  group_list: GroupList,
  load_attendance: LoadAttendance,
  submit_attendance: SubmitAttendance,
})

export default Reducers;