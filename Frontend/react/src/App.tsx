// =============================================
// WOW 웹 앱 라우팅
// 서비스 소개 랜딩페이지 중심
// 실제 금융 서비스는 React Native 앱에서 구현
// =============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 랜딩 - 서비스 소개 */}
        <Route path="/" element={<div>서비스 소개</div>} />

        {/* 앱 다운로드 유도 페이지 */}
        <Route path="/download" element={<div>앱 다운로드</div>} />

        {/* 기능 소개 페이지 */}
        <Route path="/features" element={<div>기능 소개</div>} />

        {/* 404 - 존재하지 않는 경로 */}
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App