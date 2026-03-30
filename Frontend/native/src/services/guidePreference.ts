import * as FileSystem from 'expo-file-system/legacy';

interface GuidePreferenceState {
  hideCalendarGuide?: boolean;
  // 엑셀 업로드 가이드 영구 숨김 설정 (최초 1회 노출 후 사용자 선택에 따라 저장)
  hideExcelUploadGuide?: boolean;
}

const GUIDE_PREFERENCE_FILE = `${FileSystem.documentDirectory ?? ''}wow-guide-preference.json`;

async function readGuidePreferenceState(): Promise<GuidePreferenceState> {
  if (!FileSystem.documentDirectory) {
    return {};
  }

  try {
    const info = await FileSystem.getInfoAsync(GUIDE_PREFERENCE_FILE);
    if (!info.exists) {
      return {};
    }

    const raw = await FileSystem.readAsStringAsync(GUIDE_PREFERENCE_FILE, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return raw ? (JSON.parse(raw) as GuidePreferenceState) : {};
  } catch (error) {
    console.warn('Failed to read guide preference state', error);
    return {};
  }
}

async function writeGuidePreferenceState(nextState: GuidePreferenceState) {
  if (!FileSystem.documentDirectory) {
    return;
  }

  try {
    await FileSystem.writeAsStringAsync(
      GUIDE_PREFERENCE_FILE,
      JSON.stringify(nextState),
      { encoding: FileSystem.EncodingType.UTF8 },
    );
  } catch (error) {
    console.warn('Failed to write guide preference state', error);
  }
}

export async function shouldHideCalendarGuide() {
  const state = await readGuidePreferenceState();
  return state.hideCalendarGuide === true;
}

export async function setHideCalendarGuide(value: boolean) {
  const currentState = await readGuidePreferenceState();
  await writeGuidePreferenceState({
    ...currentState,
    hideCalendarGuide: value,
  });
}

/** 엑셀 업로드 가이드를 다시 보지 않아야 하는지 여부를 읽어옵니다. */
export async function shouldHideExcelUploadGuide() {
  const state = await readGuidePreferenceState();
  return state.hideExcelUploadGuide === true;
}

/** 엑셀 업로드 가이드 영구 숨김 설정을 저장합니다. */
export async function setHideExcelUploadGuide(value: boolean) {
  const currentState = await readGuidePreferenceState();
  await writeGuidePreferenceState({
    ...currentState,
    hideExcelUploadGuide: value,
  });
}
