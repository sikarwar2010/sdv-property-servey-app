import type { AuthUser } from '@/src/types';

/** Lets sync (and other modules) read the signed-in user without importing the auth store. */
let readUser: () => AuthUser | null = () => null;

export function bindAuthSessionReader(reader: () => AuthUser | null): void {
  readUser = reader;
}

export function getAuthSessionUser(): AuthUser | null {
  return readUser();
}
