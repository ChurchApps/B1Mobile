import { ArrayHelper } from "../mobilehelper";
import { PersonInterface, ServiceTimeInterface } from "./Interfaces";

export class CheckinHelper {
  static groupTree: any = null;
  static serviceId: string = "";
  static peopleIds: string[] = [];
  static householdMembers: PersonInterface[] = [];
  static serviceTimes: ServiceTimeInterface[] = [];

  static clearData = () => {
    this.groupTree = null;
    this.serviceId = "";
    this.peopleIds = [];
    this.householdMembers = [];
    this.serviceTimes = [];
  };

  static setExistingAttendance = async (existingAttendance: any) => {
    existingAttendance?.forEach((item: any) => {
      item.visitSessions?.forEach(async (visitSession: any) => {
        const member = ArrayHelper.getOne(this.householdMembers, "id", item.personId);
        if (member) {
          const time = ArrayHelper.getOne(member.serviceTimes, "id", visitSession.session.serviceTimeId);
          if (time) {
            this.groupTree.forEach((group_item: any) => {
              group_item.items.forEach((itemG: any) => {
                if (visitSession.session.groupId == itemG.id) time.selectedGroup = itemG;
              });
            });
          }
        }
      });
    });
  };
}
