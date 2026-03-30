import { useCallback, useState } from 'react';

/**
 * useModalState
 * 바텀시트나 모달처럼 열림/닫힘 상태만 필요한 UI에서 재사용합니다.
 */
export function useModalState(defaultValue = false) {
  const [visible, setVisible] = useState(defaultValue);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  return {
    visible,
    open,
    close,
    setVisible,
  };
}
