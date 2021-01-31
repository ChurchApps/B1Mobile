//CHUMS
export interface GroupInterface { id?: number, name?: string, categoryName?: string, parentPickup?: boolean }
export interface NameInterface { first?: string, middle?: string, last?: string, nick?: string, display?: string }
export interface PersonInterface { id?: number, name: NameInterface, membershipStatus?: string, gender?: string, birthDate?: Date, maritalStatus?: string, anniversary?: Date, photo?: string, photoUpdated?: Date, householdId?: number, householdRole?: string, userId?: number }
export interface ServiceInterface { id?: number, campusId?: number, name?: string }
export interface ServiceTimeInterface { id?: number, name?: string, groups?: GroupInterface[] }
export interface SessionInterface { id?: number, groupId?: number, serviceTimeId?: number, sessionDate?: Date, displayName?: string }
export interface VisitInterface { id?: number, personId?: number, serviceId?: number, groupId?: number, visitDate?: Date, visitSessions?: VisitSessionInterface[], person?: PersonInterface }
export interface VisitSessionInterface { id?: number, visitId?: number, sessionId?: number, visit?: VisitInterface, session?: SessionInterface }