-- 사용자
CREATE TABLE users (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         VARCHAR(50)     UNIQUE,
    ssafy_oauth_id  VARCHAR(50)     UNIQUE,
    pw              VARCHAR(255),
    name            VARCHAR(10),
    gender          VARCHAR(1),
    phone_number    VARCHAR(20)     UNIQUE,
    birth_date      DATE,
    role            VARCHAR(5),
    alarm_enabled   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_role
        CHECK (role IN ('USER', 'ADMIN'))
);

-- 알림 유형
CREATE TABLE notification_types (
    notification_types_id   BIGSERIAL       PRIMARY KEY,
    notification_types_cord VARCHAR(20)     NOT NULL UNIQUE,
    notification_name       VARCHAR(20)     NOT NULL
);

-- 약관
CREATE TABLE terms (
    term_id      BIGSERIAL       PRIMARY KEY,
    title        VARCHAR(100)    NOT NULL,
    version      VARCHAR(20)     NOT NULL,
    effective_at DATE            NOT NULL,
    required     BOOLEAN         NOT NULL DEFAULT TRUE,
    s3_url       TEXT            NOT NULL,
    created_at   TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 지출 날씨
CREATE TABLE spending_weather (
    spending_weather_id BIGSERIAL       PRIMARY KEY,
    weather_name        VARCHAR(15)     NOT NULL,
    icon_code           VARCHAR(10)
);

-- 지출 유형 (AI 분석용)
CREATE TABLE spending_type (
    spending_type_id    BIGSERIAL       PRIMARY KEY,
    name                VARCHAR(15)     NOT NULL,
    icon_code           VARCHAR(20),
    summary             VARCHAR(255)
);

-- 지출 카테고리
CREATE TABLE expense_category (
    category_id     SERIAL          PRIMARY KEY,
    category_name   VARCHAR(10),
    category_icon   VARCHAR(10)
);

-- FCM 토큰
CREATE TABLE fcm_tokens (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     VARCHAR(255)    NOT NULL,
    token       VARCHAR(255)    NOT NULL UNIQUE,
    device_type VARCHAR(255)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL,
    updated_at  TIMESTAMP       NOT NULL
);

-- 회원 약관 동의 이력
CREATE TABLE user_terms (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    term_id     BIGINT          NOT NULL,
    agreed      BOOLEAN         NOT NULL,
    agreed_at   TIMESTAMP(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_terms_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_terms_term
        FOREIGN KEY (term_id)
        REFERENCES terms (term_id)
        ON DELETE CASCADE
);

-- 계좌
CREATE TABLE accounts (
    account_id      BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    bank_code       VARCHAR(10),
    bank_name       VARCHAR(20),
    account_number  VARCHAR(50)     NOT NULL UNIQUE,
    account_name    VARCHAR(100),
    status          VARCHAR(30),
    created_at      TIMESTAMP,
    closed_at       TIMESTAMP,

    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

-- 캘린더
CREATE TABLE calendar (
    calendar_id         BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL,
    spending_weather_id BIGINT,
    date                DATE            NOT NULL,
    day_type            VARCHAR(20)     NOT NULL,
    daily_total         BIGINT,
    transaction_count   INTEGER,
    memo                TEXT,
    description         VARCHAR(100),
    is_forecast         BOOLEAN,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL,

    CONSTRAINT fk_calendar_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_calendar_spending_weather
        FOREIGN KEY (spending_weather_id)
        REFERENCES spending_weather (spending_weather_id),

    CONSTRAINT chk_calendar_day_type
        CHECK (day_type IN ('PAST', 'TODAY', 'NEAR_FUTURE', 'FAR_FUTURE'))
);

-- 예산 목표
CREATE TABLE budget_goal (
    budget_goal_id  BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    amount          INTEGER         NOT NULL,
    budget_date     DATE            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_budget_goal_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT uk_budget_goal_user_month
        UNIQUE (user_id, budget_date)
);

-- AI 분석
CREATE TABLE ai_analysis (
    ai_analysis_id          BIGSERIAL       PRIMARY KEY,
    user_id                 BIGINT          NOT NULL,
    spending_type_id        BIGINT          NOT NULL,
    year                    INTEGER         NOT NULL,
    month                   INTEGER         NOT NULL,
    analysis_type           VARCHAR(10),
    description             TEXT,
    comparison_description  TEXT,
    created_at              TIMESTAMP,

    CONSTRAINT fk_ai_analysis_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_analysis_spending_type
        FOREIGN KEY (spending_type_id)
        REFERENCES spending_type (spending_type_id),

    CONSTRAINT chk_ai_analysis_type
        CHECK (analysis_type IN ('MONTHLY', 'HALFYEARLY'))
);

-- 거래 내역
CREATE TABLE transactions (
    transaction_id  BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    account_id      BIGINT,
    category_id     INTEGER         NOT NULL,
    amount          NUMERIC(18, 4)  NOT NULL,
    payment_type    VARCHAR(10)     NOT NULL,
    merchant_name   VARCHAR(255),
    memo            VARCHAR(255),
    title           VARCHAR(20),
    created_at      TIMESTAMP,
    transaction_at  TIMESTAMP       NOT NULL,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (account_id),

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES expense_category (category_id)
);

-- 고정 지출
CREATE TABLE fixed_expense (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    account_id      BIGINT,
    transaction_id  BIGINT          UNIQUE,
    icon            VARCHAR(10),
    name            VARCHAR(50)     NOT NULL,
    amount          INTEGER         NOT NULL,
    due_day         INTEGER         NOT NULL,
    is_auto         BOOLEAN,
    is_enable       BOOLEAN,
    payment_status  VARCHAR(20),
    created_at      TIMESTAMP,

    CONSTRAINT fk_fixed_expense_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_fixed_expense_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (account_id),

    CONSTRAINT fk_fixed_expense_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions (transaction_id)
);

-- AI 분석 카테고리 결과
CREATE TABLE ai_analysis_category_result (
    ai_analysis_category_result_id  BIGSERIAL       PRIMARY KEY,
    ai_analysis_id                  BIGINT          NOT NULL,
    category_id                     INTEGER         NOT NULL,
    my_ratio                        NUMERIC(5, 2)   NOT NULL,
    base_ratio                      NUMERIC(5, 2)   NOT NULL,
    price                           INTEGER         NOT NULL,

    CONSTRAINT fk_ai_analysis_category_result_analysis
        FOREIGN KEY (ai_analysis_id)
        REFERENCES ai_analysis (ai_analysis_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_analysis_category_result_category
        FOREIGN KEY (category_id)
        REFERENCES expense_category (category_id)
);

-- 지출 카테고리
INSERT INTO expense_category (category_name) VALUES
    ('인터넷쇼핑'), ('인테리어/가정용품'), ('교통서비스'), ('음/식료품소매'),
    ('외식'), ('제과/제빵/떡/케익'), ('커피/음료'), ('패스트푸드'),
    ('자동차/유지비'), ('시스템/통신'), ('건강/기호식품'), ('분식'),
    ('육류/회식'), ('선물/완구'), ('병원/의료'), ('화장품소매'),
    ('공연관람'), ('의약/의료품'), ('건강/뷰티/마사지'), ('수리서비스');

-- 지출 날씨
INSERT INTO spending_weather (weather_name, icon_code) VALUES
    ('맑음',  'sunny'),
    ('구름',  'cloudy'),
    ('흐림',  'overcast'),
    ('비',    'rain'),
    ('폭우',  'storm')
ON CONFLICT (weather_name) DO NOTHING;

-- 지출 유형
INSERT INTO spending_type (name) VALUES
    ('외식·생활잡화형'),
    ('사무·서적형'),
    ('외식·드라이브형'),
    ('차량·의료관리형'),
    ('외식·의료집중형'),
    ('의료·자동차형'),
    ('교육·선물 특화형'),
    ('커피·디저트형');