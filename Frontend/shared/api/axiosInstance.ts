// =============================================
// Axios instance
// 웹/앱 공용으로 사용하는 기본 axios 인스턴스입니다.
// accessToken 은 메모리에서만 다루고, refreshToken 은 httpOnly 쿠키 전제를 따릅니다.
// =============================================

import axios from 'axios';
import { BASE_URL } from './endpoints';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------
// Request interceptor
// 현재는 Authorization 헤더를 setAuthToken 으로만 주입합니다.
// 추후 authStore 와 연결되면 여기에서 요청별 공통 헤더를 더 붙일 수 있습니다.
// -----------------------------------------------
axiosInstance.interceptors.request.use(
  // shared 패키지는 axios 타입을 독립 설치 없이 검사하므로,
  // 인터셉터 인자는 명시적으로 any 로 적어 단독 타입체크가 막히지 않게 둡니다.
  (config: any) => config,
  (error: any) => Promise.reject(error),
);

// -----------------------------------------------
// Response interceptor
// 401 이 왔을 때 refresh 재시도 로직은 아직 넣지 않습니다.
// refresh 전략은 백엔드 스펙 확정 후 별도로 붙이는 편이 안전합니다.
// -----------------------------------------------
axiosInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    if (error.response?.status === 401) {
      // TODO: refresh API 재시도 정책과 authStore 연동은
      // 백엔드 응답 스펙이 확정된 뒤에 추가합니다.
    }

    return Promise.reject(error);
  },
);

// -----------------------------------------------
// Authorization header helper
// accessToken 은 저장소가 아니라 메모리(Zustand) 기준으로 관리합니다.
// 로그인 성공/로그아웃 시점에 이 함수를 호출해 공통 헤더를 동기화합니다.
// -----------------------------------------------
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axiosInstance.defaults.headers.common.Authorization;
};

export default axiosInstance;
