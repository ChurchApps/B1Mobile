import { combineReducers } from "redux";

import MemberData from './memberDataReducer';
import HouseholdList from './householdListReducers';
import ServiceList from './servicesReducers';
import ServiceTime from './servicesTimeReducer';
import GroupList from './groupsListReducers';
import LoadAttendance from './loadAttendanceReducers';
import SubmitAttendance from './submitAttendanceReducers';

const Reducers = combineReducers({
  member_data: MemberData,
  household_list: HouseholdList,
  services_data: ServiceList,
  services_time: ServiceTime,
  group_list: GroupList,
  load_attendance: LoadAttendance,
  submit_attendance: SubmitAttendance,
})

export default Reducers;