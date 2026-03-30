package com.wow.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

// [added] 이유: @EnableJpaAuditing이 메인 클래스에 있으면 @WebMvcTest 등 테스트 슬라이스에서 EntityManagerFactory 로딩 오류 발생 → 별도 설정 클래스로 분리
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
