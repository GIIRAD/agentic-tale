import { HTTPMethod } from '../../shared/types/method';
import FetchError from './fetch-error';

async function fetchGet<O>(
  url: string, params?: {idToken?: string},
): Promise<O> {
  const fetchData = {
    method: HTTPMethod.GET,
    headers: {
      Authorization: `Bearer ${params?.idToken}`,
    },
  };

  const res = await fetch(url, fetchData);
  if (!res.ok) {
    const error = new FetchError(res.status, 'An error occurred while getting the data.');
    throw error;
  }
  const obj: O = await res.json();
  return obj;
}

export default fetchGet;
