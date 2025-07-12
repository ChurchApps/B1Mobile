import { MessageInterface } from "@churchapps/helpers";

export type ApiListType = "MembershipApi" | "MessagingApi" | "AttendanceApi" | "ContentApi" | "GivingApi";
export interface AppearanceInterface {
  primaryColor?: string;
  primaryContrast?: string;
  secondaryColor?: string;
  secondaryContrast?: string;
  logoLight?: string;
  logoDark?: string;
}
export interface LinkInterface {
  id?: string;
  churchId: string;
  category: string;
  url?: string;
  text: string;
  sort: number;
  linkType: string;
  linkData: string;
  icon: string;
  photo?: string;
}

export interface ApiInterface {
  name: string;
  keyName?: string;
  permissions: RolePermissionInterface[];
  jwt: string;
}
export interface ChurchInterface {
  id?: string;
  name?: string;
  registrationDate?: Date;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  subDomain?: string;
  settings?: GenericSettingInterface[];
  archivedDate?: Date;
}
export interface LoginResponseInterface {
  user: UserInterface;
  userChurches: LoginUserChurchInterface[];
  errors: string[];
}
export interface LoginUserChurchInterface {
  person: PersonInterface;
  church: ChurchInterface;
  apis: ApiInterface[];
  jwt: string;
  groups: { id: string; name: string; tags: string }[];
}
export interface PermissionInterface {
  apiName?: string;
  section?: string;
  action?: string;
  displaySection?: string;
  displayAction?: string;
}
export interface RoleInterface {
  id?: string;
  churchId?: string;
  appName?: string;
  name?: string;
}
export interface RolePermissionInterface {
  id?: string;
  churchId?: string;
  roleId?: string;
  apiName?: string;
  contentType?: string;
  contentId?: string;
  action?: string;
}
export interface RoleMemberInterface {
  id?: string;
  churchId?: string;
  roleId?: string;
  userId?: string;
  user?: UserInterface;
}
export interface UserInterface {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  authGuid?: string;
  displayName?: string;
  registrationDate?: Date;
  lastLogin?: Date;
  password?: string;
  jwt?: string;
}
export interface GenericSettingInterface {
  id?: string;
  churchId?: string;
  keyName?: string;
  value?: string;
  public?: number;
}

export interface GroupServiceTimeInterface {
  id?: string;
  groupId?: string;
  serviceTimeId?: string;
  serviceTime?: ServiceTimeInterface;
}
export interface GroupInterface {
  id?: string;
  name?: string;
  categoryName?: string;
  parentPickup?: boolean;
}
export interface NameInterface {
  first?: string;
  middle?: string;
  last?: string;
  nick?: string;
  display?: string;
}
export interface QuestionInterface {
  id?: string;
  formId?: string;
  title?: string;
  fieldType?: string;
  placeholder?: string;
  description?: string;
  choices?: [{ value?: string; text?: string }];
}
export interface AnswerInterface {
  id?: string;
  value?: string;
  questionId?: string;
  formSubmissionId?: string;
}
export interface FormInterface {
  id?: string;
  name?: string;
  contentType?: string;
  restricted?: boolean;
}
export interface FormSubmissionInterface {
  id?: string;
  formId?: string;
  contentType?: string;
  contentId?: string;
  form?: FormInterface;
  answers?: AnswerInterface[];
  questions?: QuestionInterface[];
}
export interface ContactInfoInterface {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  homePhone?: string;
  mobilePhone?: string;
  workPhone?: string;
  email?: string;
}
export interface PersonInterface {
  id?: string;
  name: NameInterface;
  contactInfo: ContactInfoInterface;
  membershipStatus?: string;
  gender?: string;
  birthDate?: Date;
  maritalStatus?: string;
  anniversary?: Date;
  photo?: string;
  photoUpdated?: Date;
  householdId?: string;
  householdRole?: string;
  userId?: string;
  formSubmissions?: [FormSubmissionInterface];
}
export interface ServiceInterface {
  id?: string;
  campusId?: string;
  name?: string;
}
export interface ServiceTimeInterface {
  id?: string;
  name?: string;
  groups?: GroupInterface[];
}
export interface IPermission {
  api: string;
  contentType: string;
  action: string;
}

export interface UserSearchInterface {
  toPersonId?: string;
  anniversary?: Date;
  birthDate?: Date;
  contactInfo: ContactInfoInterface;
  conversationId?: string;
  gender?: string;
  householdId?: string;
  householdRole?: string;
  id?: string;
  maritalStatus?: string;
  membershipStatus?: string;
  name: NameInterface;
  photo?: string;
  photoUpdated?: Date;
  conversation?: ConversationInterface;
  messages?: MessageInterface[];
  DisplayName?: string;
}

// Messaging interfaces
export interface ConversationCheckInterface {
  id: string;
  churchId: string;
  conversationId: string;
  fromPersonId: string;
  toPersonId: string;
  notifyPersonId: string;
  conversation: ConversationInterface;
}
export interface ConversationInterface {
  id?: string;
  churchId?: string;
  contentType?: string;
  contentId?: string;
  title?: string;
  dateCreated?: Date;
  groupId?: string;
  visibility?: string;
  firstPostId?: string;
  lastPostId?: string;
  allowAnonymousPosts?: boolean;
  postCount?: number;
  messages?: MessageInterface[];
}

export interface ConversationCreateInterface {
  allowAnonymousPosts: boolean;
  contentType: string;
  contentId: string;
  title: string;
  visibility: string;
  churchId: string;
  id: string;
}
export interface PrivateMessagesCreate {
  fromPersonId: string;
  toPersonId: string;
  conversationId: string;
  churchId: string;
  id: string;
}

export interface TimelinePostInterface {
  UniqueId?: string;
  postType?: string;
  postId?: string;
  groupId?: string;
  timeSent?: Date;
  timeUpdated?: Date;
  conversationId?: string;
  conversation?: ConversationInterface;
  data?: Record<string, unknown>;
}

export interface UserPostInterface {
  index: string;
  postType?: string;
  postId?: string;
  groupId?: string;
  timeSent?: Date;
  timeUpdated?: Date;
  conversationId?: string;
  conversation?: ConversationInterface;
  data?: Record<string, unknown>;
  groupPhoto?: string;
  groupName: string;
}
export interface PlanInterface {
  id?: string;
  churchId?: string;
  name?: string;
  serviceDate?: Date;
  notes?: string;
}
export interface PositionInterface {
  id?: string;
  churchId?: string;
  planId?: string;
  categoryName?: string;
  name?: string;
  count?: number;
  groupId?: string;
}
export interface AssignmentInterface {
  id?: string;
  churchId?: string;
  positionId?: string;
  personId?: string;
  status?: string;
}
export interface TimeInterface {
  id?: string;
  churchId?: string;
  planId?: string;
  displayName?: string;
  startTime?: Date;
  endTime?: Date;
  teams?: string;
  teamList?: string[];
}
export interface BlockoutDateInterface {
  id?: string;
  churchId?: string;
  personId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}
