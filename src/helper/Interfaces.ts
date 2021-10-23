export interface ApiConfig { keyName: string, url: string, jwt: string, permisssions: RolePermissionInterface[] }
export type ApiListType = "AccessApi" | "MembershipApi" | "AttendanceApi";

export interface ApiInterface { name: string, keyName?: string, permissions: RolePermissionInterface[], jwt: string }
export interface ApplicationInterface { name: string, keyName?: string, permissions: RolePermissionInterface[] }
export interface ChurchAppInterface { id?: string, churchId?: string, appName?: string }
export interface ChurchInterface { id?: string, name: string, registrationDate?: Date, apis?: ApiInterface[], apps?: ApplicationInterface[], address1?: string, address2?: string, city?: string, state?: string, zip?: string, country?: string, subDomain?: string }
export interface ForgotResponse { emailed: boolean }
export interface LoadCreateUserRequestInterface { userEmail: string, fromEmail?: string, subject?: string, body?: string, userName: string }
export interface LoginResponseInterface { user: UserInterface, churches: ChurchInterface[], errors: string[] }
export interface PermissionInterface { apiName?: string, section?: string, action?: string, displaySection?: string, displayAction?: string }
export interface RegisterInterface { churchName?: string, displayName?: string, email?: string, password?: string }
export interface RoleInterface { id?: string, churchId?: string, appName?: string, name?: string }
export interface RolePermissionInterface { id?: string, churchId?: string, roleId?: string, apiName?: string, contentType?: string, contentId?: string, action?: string }
export interface RoleMemberInterface { id?: string, churchId?: string, roleId?: string, userId?: string, user?: UserInterface }
export interface ResetPasswordRequestInterface { userEmail: string, fromEmail: string, subject: string, body: string }
export interface ResetPasswordResponseInterface { emailed: boolean }
export interface SwitchAppRequestInterface { appName: string, churchId: string }
export interface SwitchAppResponseInterface { appName: string, churchId: string }
export interface UserInterface { id?: string, email?: string, authGuid?: string, displayName?: string, registrationDate?: Date, lastLogin?: Date, password?: string }

export interface GroupServiceTimeInterface { id?: string, groupId?: string, serviceTimeId?: string, serviceTime?: ServiceTimeInterface }
export interface GroupInterface { id?: string, name?: string, categoryName?: string, parentPickup?: boolean }
export interface NameInterface { first?: string, middle?: string, last?: string, nick?: string, display?: string }
export interface PersonInterface { id?: string, name: NameInterface, membershipStatus?: string, gender?: string, birthDate?: Date, maritalStatus?: string, anniversary?: Date, photo?: string, photoUpdated?: Date, householdId?: string, householdRole?: string, userId?: string }
export interface ServiceInterface { id?: string, campusId?: string, name?: string }
export interface ServiceTimeInterface { id?: string, name?: string, groups?: GroupInterface[] }
export interface SessionInterface { id?: string, groupId?: string, serviceTimeId?: string, sessionDate?: Date, displayName?: string }
export interface VisitInterface { id?: string, personId?: string, serviceId?: string, groupId?: string, visitDate?: Date, visitSessions?: VisitSessionInterface[], person?: PersonInterface }
export interface VisitSessionInterface { id?: string, visitId?: string, sessionId?: string, visit?: VisitInterface, session?: SessionInterface }