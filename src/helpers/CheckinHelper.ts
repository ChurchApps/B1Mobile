import { ArrayHelper } from "@churchapps/helpers";
import { GroupInterface, PersonInterface, ServiceTimeInterface } from "./Interfaces";

interface GroupTreeNode {
  id?: string;
  name?: string;
  items: GroupInterface[];
}

interface VisitSession {
  session: { serviceTimeId: string; groupId: string };
}

interface AttendanceRecord {
  personId: string;
  visitSessions?: VisitSession[];
}

// Extended at runtime with serviceTimes[] and selectedGroup during checkin flow
interface CheckinMember extends PersonInterface {
  serviceTimes?: (ServiceTimeInterface & { selectedGroup?: GroupInterface })[];
}

export class CheckinHelper {
  static groupTree: GroupTreeNode[] | null = null;
  static serviceId: string = "";
  static peopleIds: string[] = [];
  static householdMembers: CheckinMember[] = [];
  static serviceTimes: ServiceTimeInterface[] = [];

  static clearData = () => {
    this.groupTree = null;
    this.serviceId = "";
    this.peopleIds = [];
    this.householdMembers = [];
    this.serviceTimes = [];
  };

  static setExistingAttendance = async (existingAttendance: AttendanceRecord[]) => {
    existingAttendance?.forEach((item) => {
      item.visitSessions?.forEach(async (visitSession) => {
        const member = ArrayHelper.getOne(this.householdMembers, "id", item.personId) as CheckinMember | undefined;
        if (member) {
          const time = ArrayHelper.getOne(member.serviceTimes || [], "id", visitSession.session.serviceTimeId);
          if (time) {
            this.groupTree?.forEach((group_item) => {
              group_item.items.forEach((itemG) => {
                if (visitSession.session.groupId == itemG.id) time.selectedGroup = itemG;
              });
            });
          }
        }
      });
    });
  };
}
