const cache = new Map<string, Promise<any>>();

export async function fetchJsonCached(url: string) {
  if (cache.has(url)) {
    return cache.get(url)!;
  }

  const request = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erro ao buscar ${url} (${res.status})`);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    })
    .catch((err) => {
      cache.delete(url);
      throw err;
    });

  cache.set(url, request);
  return request;
}
