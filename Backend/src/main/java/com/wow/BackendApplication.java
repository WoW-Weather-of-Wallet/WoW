package com.wow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
// [removed] 삭제 전: @EnableJpaAuditing | 이유: 메인 클래스에 있으면 @WebMvcTest 등 테스트 슬라이스 실패 → JpaAuditingConfig로 분리
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
