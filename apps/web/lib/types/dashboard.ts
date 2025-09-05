export interface GmailLabel {
  id: string;
  name: string;
  type: string;
  messagesTotal: number;
  messagesUnread: number;
  threadsTotal: number;
  threadsUnread: number;
}

export interface DriveFolder {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
  owner: string;
  hasParent: boolean;
  parents: string[];
}

export interface DriveParent {
  id: string;
  name: string;
  parents: string[];
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  googleAccount?: {
    googleId: string;
    email: string;
    name: string;
    picture: string;
  } | null;
}
