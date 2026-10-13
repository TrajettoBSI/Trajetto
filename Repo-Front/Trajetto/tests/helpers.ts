import { AxiosError, AxiosResponse } from 'axios';

export function apiError(status: number, code: string, message: string, details?: unknown[]) {
  const response = {
    status,
    data: { status, code, message, error: '', path: '/', method: 'GET', timestamp: '', traceId: 't', details },
    statusText: '',
    headers: {},
    config: {},
  } as unknown as AxiosResponse;
  return new AxiosError(message, String(status), undefined, undefined, response);
}

export function networkError() {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK);
}

export function rawResponseError(status: number, data: unknown) {
  return new AxiosError('x', String(status), undefined, undefined, { status, data } as AxiosResponse);
}
