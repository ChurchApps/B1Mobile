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
  }
  
  static setExistingAttendance = async (existingAttendance: any) => {
    existingAttendance?.forEach((item: any) => {
      item.visitSessions?.forEach(async (visitSession: any) => {
        this.householdMembers?.forEach((member: any) => {
          if (member.id == item.personId) {
            member.serviceTime?.forEach((time: any) => {
              if (time.id == visitSession.session.serviceTimeId) {
                this.groupTree.forEach((group_item: any) => {
                  group_item.items.forEach((itemG: any) => {
                    if (visitSession.session.groupId == itemG.id) {
                      time['selectedGroup'] = itemG;
                    }
                  })
                })
              }
            })
          }
        })
      })
    })
  }

  
}
