package com.wow.domain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    // auth사용
    // 캔린더 거래내역 불러오는 파트 사용
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
