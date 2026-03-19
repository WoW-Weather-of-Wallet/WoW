package com.wow.domain.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.UserDetailsService;

class JwtTokenProviderTest {

    private static final String SECRET = "dGVzdC1qd3Qtc2VjcmV0LWtleS0yMDI2LXdvdy10ZXN0LWp3dC1zZWNyZXQ=";
    private static final String ISSUER = "wowTest";

    private final UserDetailsService userDetailsService = Mockito.mock(UserDetailsService.class);
    private final JwtTokenProvider jwtTokenProvider = new JwtTokenProvider(
            SECRET,
            30L,
            14L,
            ISSUER,
            userDetailsService
    );

    @Test
    void parseAccessTokenRejectsTokenWithUnexpectedIssuer() {
        String token = Jwts.builder()
                .subject("wowuser")
                .issuer("otherIssuer")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(30, ChronoUnit.MINUTES)))
                .claim("roles", List.of("ROLE_USER"))
                .claim("type", "access")
                .claim("aud", "wow-app")
                .signWith(signingKey())
                .compact();

        assertThatThrownBy(() -> jwtTokenProvider.parseAccessToken(token))
                .isInstanceOf(io.jsonwebtoken.JwtException.class)
                .hasMessageContaining("issuer");
    }

    @Test
    void parseRefreshTokenRejectsTokenWithUnexpectedAudience() {
        String token = Jwts.builder()
                .subject("wowuser")
                .issuer(ISSUER)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(14, ChronoUnit.DAYS)))
                .claim("type", "refresh")
                .claim("aud", "other-app")
                .signWith(signingKey())
                .compact();

        assertThatThrownBy(() -> jwtTokenProvider.parseRefreshToken(token))
                .isInstanceOf(io.jsonwebtoken.JwtException.class)
                .hasMessageContaining("audience");
    }

    @Test
    void validateTokenReturnsFalseWhenIssuerIsUnexpected() {
        String token = Jwts.builder()
                .subject("wowuser")
                .issuer("otherIssuer")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(30, ChronoUnit.MINUTES)))
                .claim("type", "access")
                .claim("aud", "wow-app")
                .signWith(signingKey())
                .compact();

        assertThat(jwtTokenProvider.validateToken(token)).isFalse();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
    }
}
