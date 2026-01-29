export interface AnswerInterface {
  id?: string;
  value?: string;
  questionId?: string;
  formSubmissionId?: string;
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
export interface GroupInterface {
  id?: string;
  name?: string;
  categoryName?: string;
  memberCount?: number;
  trackAttendance?: boolean;
  parentPickup?: boolean;
}
export interface GroupServiceTimeInterface {
  id?: string;
  groupId?: string;
  serviceTimeId?: string;
  serviceTime?: ServiceTimeInterface;
}
export interface NameInterface {
  first?: string;
  middle?: string;
  last?: string;
  nick?: string;
  display?: string;
}
export interface PersonInterface {
  id?: string;
  name: NameInterface;
  contactInfo: ContactInfoInterface;
  membershipStatus?: string;
  gender?: string;
  birthDate?: string;  // YYYY-MM-DD format - date-only field
  maritalStatus?: string;
  anniversary?: string;  // YYYY-MM-DD format - date-only field
  photo?: string;
  photoUpdated?: Date;
  householdId?: string;
  householdRole?: string;
  userId?: string;
  formSubmissions?: [FormSubmissionInterface];
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
export interface ServiceInterface {
  id?: string;
  campusId?: string;
  name?: string;
  campus?: CampusInterface;
}
export interface ServiceTimeInterface {
  id?: string;
  name?: string;
  longName?: string;
  serviceId?: string;
  groups?: GroupInterface[];
}
