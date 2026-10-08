type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string) {
  const line = `${new Date().toISOString()} [${level}] ${message}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info(message: string) {
    write("info", message);
  },
  warn(message: string) {
    write("warn", message);
  },
  error(message: string) {
    write("error", message);
  },
};
