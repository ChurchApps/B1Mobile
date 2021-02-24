export interface ApiConfig { keyName: string, url: string, jwt: string, permisssions: RolePermissionInterface[] }
export type ApiListType = "AccessApi" | "MembershipApi" | "AttendanceApi" | "B1Api" | "GivingApi";


//B1
export interface LinkInterface { id?: string, churchId: string, category: string, url?: string, text?: string, sort?: number, linkType: string, linkData: string, icon: string }
export interface PageInterface { id?: string, churchId: string, name: string, content: string }

//AccessManagment
export interface LoginRequestInterface { email: string, password: string }
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

export interface UserInterface { id?: string, email?: string, authGuid?: string, displayName?: string, registrationDate?: Date, lastLogin?: Date, password?: string }