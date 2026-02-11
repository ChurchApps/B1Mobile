export interface ProfileChange {
  field: string;
  label: string;
  value: string;
}

export interface VisibilityPreferenceInterface {
  id?: string;
  personId?: string;
  address?: "everyone" | "members" | "groups";
  phoneNumber?: "everyone" | "members" | "groups";
  email?: "everyone" | "members" | "groups";
}

export interface TaskInterface {
  id?: string;
  dateCreated?: Date;
  associatedWithType?: string;
  associatedWithId?: string;
  associatedWithLabel?: string;
  createdByType?: string;
  createdById?: string;
  createdByLabel?: string;
  assignedToType?: string;
  assignedToId?: string;
  assignedToLabel?: string;
  title?: string;
  status?: string;
  data?: string;
}

export const fieldDefinitions = [
  { key: "name.first", label: "First Name" },
  { key: "name.middle", label: "Middle Name" },
  { key: "name.last", label: "Last Name" },
  { key: "photo", label: "Photo" },
  { key: "birthDate", label: "Birth Date" },
  { key: "contactInfo.email", label: "Email" },
  { key: "contactInfo.address1", label: "Address Line 1" },
  { key: "contactInfo.address2", label: "Address Line 2" },
  { key: "contactInfo.city", label: "City" },
  { key: "contactInfo.state", label: "State" },
  { key: "contactInfo.zip", label: "Zip" },
  { key: "contactInfo.homePhone", label: "Home Phone" },
  { key: "contactInfo.mobilePhone", label: "Mobile Phone" },
  { key: "contactInfo.workPhone", label: "Work Phone" }
];
