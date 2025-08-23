export function round(num: number, decimals: number = 2) {
  const d = 10 ** decimals;
  return Math.round(num * d) / d;
}

export function getTimestampFilename(now: Date, prefix = 'report') {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  return `${prefix}_${dateStr}_${timeStr}`;
}
