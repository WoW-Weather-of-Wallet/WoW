// =============================================
// Axios 공통 인스턴스
// 웹(React) + 앱(React Native) 공용으로 사용
// 토큰 주입은 로그인 후 setAuthToken()으로 설정
// =============================================

import axios from 'axios'
import { BASE_URL } from './endpoints'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// -----------------------------------------------
// 요청 인터셉터 - accessToken 자동 주입
// setAuthToken()으로 토큰 설정 후 모든 요청에 자동 포함
// -----------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// -----------------------------------------------
// 응답 인터셉터 - 401 Unauthorized 처리
// 토큰 만료 시 각 플랫폼 authStore에서 갱신 처리
// -----------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: 토큰 갱신 로직 구현 (각 플랫폼 authStore에서 처리)
      // 갱신 실패 시 로그인 화면으로 이동
    }
    return Promise.reject(error)
  }
)

// -----------------------------------------------
// 토큰 주입 함수
// 로그인 성공 후 authStore에서 호출
// 로그아웃 시 null 전달하여 토큰 제거
// 사용 예시: setAuthToken(accessToken)
// -----------------------------------------------
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common['Authorization']
  }
}

export default axiosInstance
