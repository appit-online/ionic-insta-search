import { getDetails } from './lib/search';

export const Name = (name: string) => `Hello ${name}`;

export function search(searchQuery: string, config = { retries: 5, delay: 1000 }) {
  return getDetails(searchQuery, config);
}
