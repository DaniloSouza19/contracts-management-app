/* eslint-disable import/prefer-default-export */

export function getToken(): string {
  const token = localStorage.getItem('@purchase-suggestion:token');

  return token ? `Bearer ${token}` : '';
}
