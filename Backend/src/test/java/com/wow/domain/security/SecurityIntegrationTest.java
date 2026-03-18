package com.wow.domain.security;

import com.wow.domain.auth.service.AuthService;
import com.wow.support.BackendIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@BackendIntegrationTest
@AutoConfigureMockMvc
@Import(SecurityIntegrationTest.TestConfig.class)
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthService authService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void resetMocks() {
        reset(authService, customUserDetailsService);
    }

    @Test
    void protectedEndpointReturnsUnauthorizedWhenTokenIsMissing() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.httpStatusCode").value(401))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());

        verify(authService, never()).logout("wowuser");
    }

    @Test
    void protectedEndpointReturnsUnauthorizedWhenTokenIsInvalid() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.httpStatusCode").value(401))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());

        verify(authService, never()).logout("wowuser");
    }

    @Test
    void protectedEndpointPassesWhenTokenIsValid() throws Exception {
        String accessToken = jwtTokenProvider.createAccessToken("wowuser", List.of("ROLE_USER"));
        when(customUserDetailsService.loadUserByUsername("wowuser"))
                .thenReturn(new org.springframework.security.core.userdetails.User(
                        "wowuser",
                        "pw",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                ));

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        verify(authService).logout("wowuser");
    }

    @TestConfiguration
    static class TestConfig {

        @Bean
        @Primary
        AuthService authService() {
            return org.mockito.Mockito.mock(AuthService.class);
        }

        @Bean
        @Primary
        CustomUserDetailsService customUserDetailsService() {
            return org.mockito.Mockito.mock(CustomUserDetailsService.class);
        }
    }
}
