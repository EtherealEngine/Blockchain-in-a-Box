import { HttpClient, Http } from './models';
import httpProvider from 'axios';

export class HttpClientAdapter<Request = any, Response = any>
  implements HttpClient
{
  request(params: Http.Request<Request>): Promise<Http.Response<Response>> {
    return httpProvider
      .request({
        url: params.url,
        method: params.method,
        data: params.body,
        headers: params.headers,
        params: params.params,
      })
      .catch((error) => {
        if (error.response) {
          throw error.response;
        }
        throw error;
      });
  }
}
