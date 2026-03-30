// shared 패키지는 웹(Vite)과 네이티브 양쪽에서 함께 참조됩니다.
// 웹 빌드에서만 import.meta.env 를 사용하므로, shared 타입체크 시 최소 선언만 열어 둡니다.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
