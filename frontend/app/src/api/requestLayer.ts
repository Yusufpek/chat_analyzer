interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

const API_BASE_URL =
  (typeof window !== 'undefined' && (window as any)?.ENV?.API_BASE_URL) ||
  (typeof process !== 'undefined' && (process as any)?.env?.API_BASE_URL) ||
  'http://localhost:8808';

function buildUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export async function request(url: string, options: RequestInit = {}): Promise<any> {
  const fullUrl = buildUrl(url);
  
  const headers: Record<string, string> = {};
  
  // Only set Content-Type if it's not FormData and not already provided
  if (!(options.body instanceof FormData) && !(options.headers as Record<string, string>)?.['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Merge with any provided headers
  Object.assign(headers, options.headers || {});
  
  const response = await fetch(fullUrl, {
    headers,
    credentials: 'include',
    ...options,
  });
  
  
  if (!response.ok) {
    const text = await response.text();

    throw new Error(text || 'Request failed');
  }
  
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json') ? response.json() : response.text();
  return result;
}