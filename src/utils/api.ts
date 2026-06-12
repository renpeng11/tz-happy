const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(path, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response;
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const response = await apiFetch(path);
  return response.json();
};

export const apiPost = async <T>(path: string, body?: unknown): Promise<T> => {
  const response = await apiFetch(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return response.json();
};

export const apiPut = async <T>(path: string, body?: unknown): Promise<T> => {
  const response = await apiFetch(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return response.json();
};

export const apiDelete = async <T>(path: string): Promise<T> => {
  const response = await apiFetch(path, {
    method: 'DELETE',
  });
  return response.json();
};
