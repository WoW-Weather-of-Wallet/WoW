package com.wow.domain.config;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    // auth사용
    // 캔린더 거래내역 불러오는 파트 사용
    // [fix] 수정 전: new RestTemplate() (타임아웃 없음) | 이유: 외부 HTTP 호출이 무한정 대기 → 스레드 고갈 가능
    @Bean
    @Primary
    public RestTemplate restTemplate() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(java.time.Duration.ofSeconds(5));
        // 엑셀 업로드 전처리는 5000 demo_app이 keyword/GMS 분류를 같이 수행하므로
        // 일반 외부 호출보다 훨씬 오래 걸릴 수 있다. 10초로는 Read timed out이 자주 나서
        // 로컬/개발 통합 테스트 기준으로 충분한 여유를 둔다.
        factory.setReadTimeout(java.time.Duration.ofSeconds(120));
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(600000);
        return new RestTemplate(factory);
    }

    @Bean(name = "aiRestTemplate")
    public RestTemplate aiRestTemplate() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(java.time.Duration.ofSeconds(5));
        // 14B 모델은 콜드 스타트와 추론 시간이 길어서 AI 전용 읽기 타임아웃을 넉넉히 둔다.
        factory.setReadTimeout(java.time.Duration.ofSeconds(180));
        return new RestTemplate(factory);
    }

    @Bean
    public DefaultMessageService defaultMessageService(
            @Value("${solapi.api-key}") String apiKey,
            @Value("${solapi.api-secret}") String apiSecret
    ) {
        return NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.solapi.com");
    }
}
