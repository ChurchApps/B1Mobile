import { GroupInterface, ServiceTimeInterface, VisitSessionInterface } from "./ChumsInterfaces";
import { ChumsCachedData } from "./ChumsCachedData";
import { Utils } from "../../../../helpers/Utils";

export class VisitSessionHelper {

    public static getByServiceTimeId(visitSessions: VisitSessionInterface[], serviceTimeId: number): VisitSessionInterface[] {
        var result: VisitSessionInterface[] = [];
        visitSessions.forEach(vs => { if (vs.session?.serviceTimeId === serviceTimeId) result.push(vs) });
        return result;
    }

    public static setValue(visitSessions: VisitSessionInterface[], serviceTimeId: number, groupId: number, displayName: string) {
        for (let i = visitSessions.length - 1; i >= 0; i--) {
            if (visitSessions[i].session?.serviceTimeId === serviceTimeId) visitSessions.splice(i, 1);
        }
        if (groupId > 0) visitSessions.push({ session: { serviceTimeId: serviceTimeId, groupId: groupId, displayName: displayName } });
    }

    public static getDisplayText = (visitSession: VisitSessionInterface) => {
        const st: ServiceTimeInterface = Utils.getById(ChumsCachedData.serviceTimes, visitSession.session?.serviceTimeId || 0);
        const group: GroupInterface = Utils.getById(st?.groups || [], visitSession.session?.groupId || 0);
        return st.name + " - " + group.name;
    }

    public static getDisplaySessions = (visitSessions: VisitSessionInterface[]) => {
        const items: string[] = [];
        visitSessions.forEach(vs => { items.push(VisitSessionHelper.getDisplayText(vs)) });
        return items.join();
    }

    public static getPickupText = (visitSession: VisitSessionInterface) => {
        const st: ServiceTimeInterface = Utils.getById(ChumsCachedData.serviceTimes, visitSession.session?.serviceTimeId || 0);
        const group: GroupInterface = Utils.getById(st?.groups || [], visitSession.session?.groupId || 0);
        if (group.parentPickup) return group.name;
        else return "";
    }

    public static getPickupSessions = (visitSessions: VisitSessionInterface[]) => {
        const items: string[] = [];
        visitSessions.forEach(vs => {
            const name = VisitSessionHelper.getDisplayText(vs)
            if (name !== "") items.push(name);
        });
        return items.join();
    }

}

