export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}
