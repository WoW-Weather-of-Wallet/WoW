# WoW

Weather Of Wallet 프로젝트 워크스페이스입니다.

## Backend 실행 가이드

Backend 루트 경로: `Backend`

기술 스택:
- Spring Boot 3.5
- Java 21
- PostgreSQL
- Redis
- JWT
- SSAFY OAuth
- Solapi SMS

## 사전 준비

- Java 21 설치
- Docker / Docker Compose 설치
- PostgreSQL 및 Redis 실행
- 필수 환경변수 설정

## 로컬 인프라 실행

DB 및 Redis compose 파일:
[docker-compose.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Infra/Docker/docker-compose.yml)

실행 방법:

```bash
cd Infra/Docker
docker compose up -d
```

이 compose 파일은 아래 서비스를 띄웁니다.
- PostgreSQL: `5432`
- Redis: `6379`

## 로컬 실행 시 주의사항

로컬 실행은 기본적으로 [application-local.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application-local.yml) 기준으로 동작합니다.

로컬 DB/Redis 설정은 다음과 같습니다.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/wowdb
  data:
    redis:
      host: localhost
```

즉 로컬 compose로 PostgreSQL/Redis를 띄운 뒤 IDE 또는 터미널에서 백엔드를 바로 실행하는 흐름을 기준으로 맞춰져 있습니다.

현재 로컬 compose는 DB/Redis만 띄우고, 백엔드 애플리케이션은 함께 띄우지 않습니다.

## 로컬 민감정보 설정

다음 값들은 [application-local.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application-local.yml) 에 직접 넣지 않고 환경변수로 주입하는 것을 기준으로 합니다.

- `JWT_SECRET`
- `SSO_SSAFY_CLIENT_ID`
- `SSO_SSAFY_CLIENT_SECRET`
- `SSO_SSAFY_REDIRECT_URI`
- `SOLAPI_API_KEY`
- `SOLAPI_API_SECRET`
- `SOLAPI_SENDER`

## 환경변수

Backend 실행 시 아래 환경변수가 필요합니다.

### Database

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

### Redis

- `REDIS_HOST`
- `REDIS_PORT`

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

## Backend 실행

```bash
cd Backend
./gradlew bootRun
```

Windows PowerShell:

```powershell
cd Backend
.\gradlew.bat bootRun
```

## 테스트 실행

```bash
cd Backend
./gradlew test
```

Windows PowerShell:

```powershell
cd Backend
.\gradlew.bat test
```

## 운영 설정

[application-prod.yml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application-prod.yml) 은 아래 값을 사용합니다.
- 외부 DB URL: `DB_URL`
- Redis 호스트/포트: 환경변수 사용
- `ddl-auto: validate`

주의할 점:
- 운영에서는 스키마 검증만 수행합니다.
- 현재 저장소에는 migration 도구 사용 방법이 정리되어 있지 않습니다.
- 새 환경에서는 DB 스키마가 미리 맞춰져 있지 않으면 기동 실패 가능성이 있습니다.

## 현재 참고사항

- Backend CI 테스트 강제는 별도 논의 중입니다.
- 네트워크 제한 환경에서는 Gradle 의존성 다운로드 때문에 테스트 실행이 막힐 수 있습니다.
- 이 README는 팀원 빠른 실행용 가이드이며, 운영 매뉴얼 전체를 대체하지는 않습니다.
