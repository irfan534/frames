export const MAX_WHATSAPP_MESSAGE_CHARS = 1500;

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + "…";
}
