import { AxiosResponse } from 'axios';

export namespace Http {
  export type Method = 'post' | 'get' | 'put' | 'delete';

  export type Request<Request = any> = {
    url: string;
    method: Method;
    body?: Request;
    headers?: any;
    params?: any;
  };

  export enum StatusCode {
    Ok = 200,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
    TooManyRequests = 429,
  }

  export type Response<Response = any> = AxiosResponse<Response>;
}

export interface HttpClient<Request = any, Response = any> {
  request: (data: Http.Request<Request>) => Promise<Http.Response<Response>>;
}

export type UseHttpProps = Omit<Http.Request, 'body' | 'params'>;

export type UseHttp<Request, Response> = {
  isLoading: boolean;
  response: Http.Response<Response>;
  error: Http.Response | null | unknown;
  request: (
    params?: Pick<Http.Request<Request>, 'body' | 'params' | 'headers'>
  ) => Promise<Http.Response<Response>>;
};
