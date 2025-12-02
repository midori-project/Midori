export async function retry<T>(fn: () => Promise<T> | T): Promise<T> { return await fn(); }
