// shared 패키지는 현재 별도 node_modules 설치 없이도 타입검사를 돌릴 수 있게 유지합니다.
// 런타임에서는 실제 axios 패키지를 사용하고, 여기서는 shared 단독 체크가 막히지 않도록 최소 선언만 둡니다.
declare module 'axios';
