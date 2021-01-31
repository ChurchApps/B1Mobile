import { VisitInterface } from "./ChumsInterfaces";

export class VisitHelper {

    public static getByPersonId(visits: VisitInterface[], personId: number): VisitInterface | null {
        var result: VisitInterface | null = null;
        visits.forEach(v => { if (v.personId === personId) result = v });
        return result;
    }

}

