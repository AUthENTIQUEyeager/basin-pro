const BASE_URL = import.meta.env.VITE_API_URL || 'https://basin-pro.onrender.com';

function getToken(): string | null {
  const auth = localStorage.getItem('bazinpro-auth');
  if (!auth) return null;
  try {
    return JSON.parse(auth)?.state?.token || null;
  } catch {
    return null;
  }
}

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(err.message || `Erreur ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: any) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: any) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
