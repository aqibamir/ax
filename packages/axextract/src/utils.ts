export async function getJSON<T = any>(
  url: string,
  headers?: Record<string, any>,
): Promise<{ ok: boolean; headers: Record<string, string>; status: number; data?: T }> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });

  const responseHeaders: Record<string, string> = {};

  for (const [key, value] of response.headers.entries()) {
    responseHeaders[key] = value;
  }

  const result = { ok: response.ok, headers: responseHeaders, status: response.status };

  try {
    const data = await response.json();
    return { ...result, data: data };
  } catch (error) {
    return result;
  }
}

export function toQueryString(params: Record<string, any>) {
  const search = new URLSearchParams(params).toString();
  return search === '' ? search : '?' + search;
}
