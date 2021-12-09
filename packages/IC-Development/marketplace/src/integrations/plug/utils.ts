import { PLUG_WHITELIST } from './constants';

export const requestConnect = () =>
  window.ic?.plug?.requestConnect({ whitelist: PLUG_WHITELIST });

export const checkIsConnected = () => window.ic?.plug?.isConnected();

export const getPrincipal = () => window.ic?.plug?.getPrincipal();

export const disconnect = () => window.ic?.plug?.disconnect();
