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

[application.yaml](/C:/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application.yaml) 기준으로 현재 기본 설정은 다음과 같습니다.

```yaml
spring:
  profiles:
    active: local
  datasource:
    url: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
```

즉 기본 local 프로필에서도 DB 호스트를 `postgres`로 바라보고 있습니다.

그래서 IDE에서 백엔드를 호스트 머신에서 바로 실행하면:
- `postgres` 호스트명이 바로 해석되지 않을 수 있고
- 이 경우 datasource 호스트를 `localhost`로 바꾸거나
- 백엔드도 같은 Docker 네트워크 안에서 실행해야 합니다.

현재 로컬 compose는 DB/Redis만 띄우고, 백엔드 애플리케이션은 같이 띄우지 않습니다.

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
