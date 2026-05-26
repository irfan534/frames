export function originsMatch(source: string, allowed: string): boolean {
  if (!allowed) return false;
  try {
    return new URL(source).origin === new URL(withProtocol(allowed)).origin;
  } catch {
    return false;
  }
}

export function withProtocol(url: string): string {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(url) ? url : `https://${url}`;
}
