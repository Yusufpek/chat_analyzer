interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function request(url: string, options: RequestOptions = {}): Promise<any> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }
  
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}
