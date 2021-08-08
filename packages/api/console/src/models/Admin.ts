export interface AdminFirstTimeResponse {
  status: string;
  firstTime: boolean;
  error: string;
}

export enum LoggedInState {
  None,
  FirstTime,
  Recurring,
}
