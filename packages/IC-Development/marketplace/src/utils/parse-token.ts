import { BaseToken } from '@/models';

export const parseToken = <T extends BaseToken>(token: string) => {
  try {
    return JSON.parse(window.atob(token.split('.')[1])) as T;
  } catch {
    return null;
  }
};
