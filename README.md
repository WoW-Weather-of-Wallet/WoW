# WoW

Weather Of Wallet backend/frontend monorepo입니다.

## Backend Quick Start

- Backend 경로: `Backend`
- 주요 스택: Spring Boot 3.5, Java 21, PostgreSQL, Redis, JWT, SSAFY OAuth, Solapi SMS

## Backend Profiles

백엔드는 기본적으로 `spring.profiles.default=local`로 설정되어 있습니다.

- `local`
  - 아무 프로필도 지정하지 않았을 때 사용하는 기본 프로필입니다.
  - 로컬 실행용 설정을 사용합니다.
- `test`
  - 자동 테스트에서 사용하는 프로필입니다.
  - [application-test.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/test/resources/application-test.yml) 기준으로 H2 in-memory DB와 테스트용 값을 사용합니다.
- `prod`
  - 운영 배포에서 사용하는 프로필입니다.
  - [application-prod.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application-prod.yml) 기준으로 실제 환경변수를 사용합니다.

정리하면:
- 로컬에서 프로필을 따로 주지 않으면 `local`
- 테스트는 `test`
- 서버 배포는 `prod`

## Required Environment Variables

공통 설정은 [application.yaml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application.yaml)에서 읽습니다.

### Local and Docker DB

로컬 기본 설정과 Docker compose에서 주로 사용하는 값입니다.

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

로컬 DB와 Redis는 [docker-compose.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Infra/Docker/docker-compose.yml)로 띄울 수 있습니다.

```bash
cd Infra/Docker
docker compose up -d
```

기본 포트:
- PostgreSQL: `5432`
- Redis: `6379`

### JWT

- `JWT_SECRET`

### SSAFY OAuth

- `SSO_SSAFY_CLIENT_ID`
- `SSO_SSAFY_CLIENT_SECRET`
- `SSO_SSAFY_REDIRECT_URI`

### Solapi

- `SOLAPI_API_KEY`
- `SOLAPI_API_SECRET`
- `SOLAPI_SENDER`

### Production Only

운영에서는 아래 값도 필요합니다.

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `SERVER_PORT`

운영용 설정은 [application-prod.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application-prod.yml)을 기준으로 적용됩니다.

## Local Run

macOS/Linux:

```bash
cd Backend
./gradlew bootRun
```

Windows PowerShell:

```powershell
cd Backend
.\gradlew.bat bootRun
```

특정 프로필로 직접 실행하고 싶으면 아래처럼 명시하면 됩니다.

```bash
./gradlew bootRun --args='--spring.profiles.active=prod'
```

## Test Run

테스트는 `test` 프로필을 사용합니다.

- DB: H2 in-memory
- JWT/SSAFY/Solapi/AWS: 테스트용 값 사용
- 목적: 로컬 PostgreSQL 없이도 테스트가 바로 돌도록 유지

macOS/Linux:

```bash
cd Backend
./gradlew test
```

Windows PowerShell:

```powershell
cd Backend
.\gradlew.bat test
```

## Test Structure

현재 백엔드 테스트는 아래처럼 나뉩니다.

- 단위 테스트
  - 서비스/유틸/필터의 개별 동작 검증
- MockMvc 테스트
  - 컨트롤러 요청 검증과 `ErrorResponse` 응답 형식 검증
- 통합 테스트
  - Spring Security 체인, `test` 프로필, H2 기반 동작 검증

테스트 작성 시 권장 규칙:

- 통합 테스트는 `@BackendIntegrationTest` 사용
- 보안/엔드포인트 응답 형식은 MockMvc 또는 통합 테스트로 검증
- 로컬 전용 값에 의존하지 않도록 `application-test.yml` 기준 유지

## Notes

- `application-local.yml`은 로컬 전용 파일로 관리하고, 비밀값은 저장소에 직접 넣지 않는 것을 권장합니다.
- CI에서 백엔드 테스트 선행 실행은 별도 인프라 협의 후 적용 예정입니다.
