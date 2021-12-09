export enum LocalStorageKey {
  DiscordExpiresIn = 'discord_expires_in',
  DiscordAccessToken = 'discord_access_token',
}

export function getFromStorage(key: LocalStorageKey): any | undefined {
  try {
    const serializedValue = localStorage.getItem(key);
    return serializedValue ? JSON.parse(serializedValue) : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export function saveToStorage(key: LocalStorageKey, value: any): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(error);
  }
}

export function removeFromStorage(key: LocalStorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
}
