import * as FileSystem from 'expo-file-system/legacy';

import type { AiAnalysisReport } from './ai';

export interface PersistedAiReportData {
  completedAt?: string;
  fromPush?: boolean;
  report?: AiAnalysisReport | null;
  fetchedAt?: string;
  cacheExpiresAt?: string;
  reportYear?: number;
  reportMonth?: number;
  ownerUserId?: string | null;
}

const AI_REPORT_STORAGE_FILE = `${FileSystem.documentDirectory ?? ''}wow-ai-report-cache.json`;

export async function loadPersistedAiReport() {
  if (!FileSystem.documentDirectory) {
    return null;
  }

  try {
    const info = await FileSystem.getInfoAsync(AI_REPORT_STORAGE_FILE);
    if (!info.exists) {
      return null;
    }

    const raw = await FileSystem.readAsStringAsync(AI_REPORT_STORAGE_FILE, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return raw ? (JSON.parse(raw) as PersistedAiReportData) : null;
  } catch (error) {
    console.warn('Failed to load persisted AI report', error);
    return null;
  }
}

export async function savePersistedAiReport(data: PersistedAiReportData) {
  if (!FileSystem.documentDirectory) {
    return;
  }

  try {
    await FileSystem.writeAsStringAsync(
      AI_REPORT_STORAGE_FILE,
      JSON.stringify(data),
      { encoding: FileSystem.EncodingType.UTF8 },
    );
  } catch (error) {
    console.warn('Failed to save persisted AI report', error);
  }
}

export async function clearPersistedAiReport() {
  if (!FileSystem.documentDirectory) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(AI_REPORT_STORAGE_FILE);
    if (!info.exists) {
      return;
    }

    await FileSystem.deleteAsync(AI_REPORT_STORAGE_FILE, { idempotent: true });
  } catch (error) {
    console.warn('Failed to clear persisted AI report', error);
  }
}
