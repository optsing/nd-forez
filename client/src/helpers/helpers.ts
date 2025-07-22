import { AnalyzeState, GenLibComplete } from "../models/client";

export function round(num: number) {
  return Math.round(num * 100) / 100;
}

export function getTimestampFilename(now: Date, prefix = 'report') {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  return `${prefix}_${dateStr}_${timeStr}`;
}

export function genLibAnalyzeState(genLib: GenLibComplete): AnalyzeState {
  let hasSuccess = false;
  for (const s of genLib.analyzed.values()) {
    if (s?.state === 'error') {
      return {
        state: 'error',
        message: 'Есть ошибки в выполненных анализах',
      }
    } else if (s?.state === 'success') {
      hasSuccess = true;
    }
  }
  if (hasSuccess) {
    return {
      state: 'success'
    }
  }
  return null;
}
