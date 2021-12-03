export interface AdminPlainResponse {
  status: string;
  error: string;
}

export interface AdminFirstTimeResponse {
  status: string;
  firstTime: boolean;
  error: string;
}

export interface AdminAuthenticationResponse {
  status: string;
  accessToken: string;
  organizationName: string;
  error: string;
}

export enum LoggedInState {
  None,
  FirstTime,
  Recurring,
}
