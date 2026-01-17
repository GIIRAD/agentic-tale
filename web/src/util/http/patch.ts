import { HTTPMethod } from '../../shared/types/method';
import FetchError from './fetch-error';

async function fetchPatch<J, T>(url: string, updatedData: J, idToken?: string): Promise<T> {
  const fetchData = {
    method: HTTPMethod.PATCH,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(updatedData),
  };
  const res = await fetch(url, fetchData);
  if (!res.ok) {
    const error = new FetchError(res.status, 'An error occurred while patching the data.');
    throw error;
  }
  const obj: T = await res.json();
  return obj;
}

export default fetchPatch;
