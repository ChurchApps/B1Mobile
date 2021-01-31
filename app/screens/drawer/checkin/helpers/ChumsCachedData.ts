import { PersonInterface, ServiceTimeInterface, VisitInterface } from "./ChumsInterfaces";

export class ChumsCachedData {
    static pendingVisits: VisitInterface[] = [];
    static existingVisits: VisitInterface[] = [];

    static householdId: number = 0;
    static householdMembers: PersonInterface[] = [];
    static serviceId: number = 0;
    static serviceTimes: ServiceTimeInterface[] = [];
}

