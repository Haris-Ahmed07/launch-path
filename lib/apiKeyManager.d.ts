declare module '@/lib/apiKeyManager' {
  export function saveApiKey(key: string): void;
  export function getApiKey(): string | null;
  export function clearApiKey(): void;
}
