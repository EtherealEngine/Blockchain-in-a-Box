export interface IBasePayload {}
export interface INumberPayload extends IBasePayload {
  key?: string;
  number: number;
}
export interface IStringPayload extends IBasePayload {
  key?: string;
  string: string;
}
export interface IStringsPayload extends IBasePayload {
  key?: string;
  strings: string[];
}
export interface IBooleanPayload extends IBasePayload {
  key?: string;
  boolean: boolean;
}