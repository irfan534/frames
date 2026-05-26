export function logError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>
) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({
    level: "error",
    context,
    message,
    ...meta,
    ts: new Date().toISOString()
  }));
}

export function logInfo(
  context: string,
  message: string,
  meta?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify({
      level: "info",
      context,
      message,
      ...meta,
      ts: new Date().toISOString()
    }));
  }
}
