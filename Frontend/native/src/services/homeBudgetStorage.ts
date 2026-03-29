import * as FileSystem from 'expo-file-system/legacy';

interface PersistedHomeBudgetState {
  amount: number;
  ownerUserId?: string | null;
  year: number;
  month: number;
}

const HOME_BUDGET_STORAGE_FILE = `${FileSystem.documentDirectory ?? ''}wow-home-budget.json`;

export async function loadPersistedHomeBudget(params: {
  ownerUserId?: string | null;
  year: number;
  month: number;
}) {
  if (!FileSystem.documentDirectory) {
    return null;
  }

  try {
    const info = await FileSystem.getInfoAsync(HOME_BUDGET_STORAGE_FILE);
    if (!info.exists) {
      return null;
    }

    const raw = await FileSystem.readAsStringAsync(HOME_BUDGET_STORAGE_FILE, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedHomeBudgetState;
    const matchesOwner = parsed.ownerUserId === (params.ownerUserId ?? null);
    const matchesPeriod = parsed.year === params.year && parsed.month === params.month;

    if (!matchesOwner || !matchesPeriod) {
      return null;
    }

    return Number.isFinite(parsed.amount) ? parsed.amount : null;
  } catch (error) {
    console.warn('Failed to load persisted home budget', error);
    return null;
  }
}

export async function savePersistedHomeBudget(state: PersistedHomeBudgetState) {
  if (!FileSystem.documentDirectory) {
    return;
  }

  try {
    await FileSystem.writeAsStringAsync(
      HOME_BUDGET_STORAGE_FILE,
      JSON.stringify(state),
      { encoding: FileSystem.EncodingType.UTF8 },
    );
  } catch (error) {
    console.warn('Failed to save persisted home budget', error);
  }
}
