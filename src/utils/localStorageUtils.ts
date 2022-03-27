/* eslint-disable import/prefer-default-export */

export function getToken(): string {
  const token = localStorage.getItem('@contracts-management:token');

  return token ? `Bearer ${token}` : '';
}
