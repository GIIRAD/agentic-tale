import { HTTPMethod } from '../../shared/types/method';
import FetchError from './fetch-error';

async function fetchPut<J, T>(url: string, dataToSet: J, idToken?: string): Promise<T> {
  const fetchData = {
    method: HTTPMethod.PUT,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(dataToSet),
  };

  const res = await fetch(url, fetchData);

  if (!res.ok) {
    const error = new FetchError(res.status, 'An error occurred while setting the data.');
    throw error;
  }

  const obj: T = await res.json();
  return obj;
}

export default fetchPut;
