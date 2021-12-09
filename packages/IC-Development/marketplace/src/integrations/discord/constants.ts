import { ENV } from '@/config';

export const DISCORD_API_URL = 'https://discord.com/api';
export const DISCORD_AUTH_URL = `${DISCORD_API_URL}/oauth2/authorize?response_type=token&client_id=${
  ENV.discord.clientId
}&state=15773059ghq9183habn&scope=identify&redirect_uri=${encodeURIComponent(
  ENV.appURL
)}`;
export const DISCORD_USERS_URL = `${DISCORD_API_URL}/users/@me`;
