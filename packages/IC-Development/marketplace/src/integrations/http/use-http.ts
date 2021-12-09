import { useEffect, useState } from 'react';
import { UseHttp, UseHttpProps } from './models';
import { HttpClientAdapter } from './http-client-adapter';
import { useSnackbar } from '@/components';
import { Http } from '.';

export const useHttp = <Request = any, Response = any>({
  url,
  method,
  headers,
}: UseHttpProps): UseHttp<Request, Response> => {
  const snackbar = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [client] = useState(new HttpClientAdapter<Request, Response>());
  const [response, setResponse] =
    useState<UseHttp<Request, Response>['response']>(null);
  const [error, setError] = useState<UseHttp<Request, Response>['error']>(null);

  const request: UseHttp<Request, Response>['request'] = async ({
    body,
    params,
    headers: _headers,
  } = {}) => {
    try {
      setIsLoading(true);
      const response = await client.request({
        url,
        method,
        headers: _headers ?? headers,
        body,
        params,
      });
      setResponse(response);

      return response;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error && error['status'] === Http.StatusCode.TooManyRequests) {
      snackbar.push({
        message: 'Raffle canister is busy, try again later.',
        gradient: 'fail',
      });
    }
  }, [error]);

  return {
    isLoading,
    response,
    error,
    request,
  };
};
