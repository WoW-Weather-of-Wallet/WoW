package com.wow.domain.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    // [added] 이유: 토큰 검증 실패 시 감사 로깅을 위한 로거
    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    // [added] 이유: access/refresh 토큰 구분 없이 refresh 토큰으로 API 인증이 가능한 보안 취약점 방지
    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";
    private static final String CLAIM_AUDIENCE = "aud";
    private static final String AUDIENCE_VALUE = "wow-app";

    private final SecretKey key;
    private final Duration accessTokenValidity;
    private final Duration refreshTokenValidity;
    private final String issuer;
    private final UserDetailsService userDetailsService;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-exp-min}") long accessTokenExpMin,
            @Value("${jwt.refresh-exp-day}") long refreshTokenExpDay,
            @Value("${jwt.issuer}") String issuer,
            UserDetailsService userDetailsService
    ) {
        this.key = createKey(secret);
        this.accessTokenValidity = Duration.ofMinutes(accessTokenExpMin);
        this.refreshTokenValidity = Duration.ofDays(refreshTokenExpDay);
        this.issuer = issuer;
        this.userDetailsService = userDetailsService;
    }

    private SecretKey createKey(String secret) {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // [fix] 수정 전: type/aud claim 없이 토큰 생성 | 이유: refresh 토큰을 access 토큰으로 사용 가능한 보안 취약점 + 서비스 간 토큰 재사용 방지
    public String createAccessToken(String userId, List<String> roles) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenValidity);

        return Jwts.builder()
                .subject(userId)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim("roles", roles)
                .claim(CLAIM_TYPE, TYPE_ACCESS)
                .claim(CLAIM_AUDIENCE, AUDIENCE_VALUE)
                .signWith(key)
                .compact();
    }

    // [fix] 수정 전: type/aud claim 없이 토큰 생성 | 이유: refresh 토큰을 access 토큰으로 사용 가능한 보안 취약점 방지
    public String createRefreshToken(String userId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(refreshTokenValidity);

        return Jwts.builder()
                .subject(userId)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim(CLAIM_TYPE, TYPE_REFRESH)
                .claim(CLAIM_AUDIENCE, AUDIENCE_VALUE)
                .signWith(key)
                .compact();
    }

    public long getRefreshTokenValidityInSeconds() {
        return refreshTokenValidity.toSeconds();
    }

    private Claims parseClaims(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
        Claims claims = jws.getPayload();
        validateRegisteredClaims(claims);
        return claims;
    }

    private void validateRegisteredClaims(Claims claims) {
        if (!issuer.equals(claims.getIssuer())) {
            throw new JwtException("ì˜¬ë°”ë¥´ì§€ ì•Šì€ JWT issuerìž…ë‹ˆë‹¤.");
        }
        Object audience = claims.get(CLAIM_AUDIENCE);
        boolean audienceMatched = false;
        if (audience instanceof String audienceValue) {
            audienceMatched = AUDIENCE_VALUE.equals(audienceValue);
        } else if (audience instanceof Collection<?> audienceValues) {
            audienceMatched = audienceValues.contains(AUDIENCE_VALUE);
        }
        if (!audienceMatched) {
            throw new JwtException("ì˜¬ë°”ë¥´ì§€ ì•Šì€ JWT audienceìž…ë‹ˆë‹¤.");
        }
    }

    // [added] 이유: access 토큰만 파싱하여 type claim 검증 + 단일 파싱으로 성능 개선 (기존: validateToken + getAuthentication에서 2회 파싱)
    public Claims parseAccessToken(String token) {
        Claims claims = parseClaims(token);
        if (!TYPE_ACCESS.equals(claims.get(CLAIM_TYPE, String.class))) {
            throw new JwtException("access 토큰이 아닙니다.");
        }
        return claims;
    }

    // [added] 이유: refresh 토큰 전용 파싱으로 type claim 검증
    public Claims parseRefreshToken(String token) {
        Claims claims = parseClaims(token);
        if (!TYPE_REFRESH.equals(claims.get(CLAIM_TYPE, String.class))) {
            throw new JwtException("refresh 토큰이 아닙니다.");
        }
        return claims;
    }

    // [fix] 수정 전: getUserIdFromToken(token) 호출로 이중 파싱 | 이유: 매 요청마다 JWT 2회 파싱 → 성능 저하, Claims를 직접 받아 단일 파싱으로 개선
    public Authentication getAuthentication(Claims claims) {
        String userId = claims.getSubject();
        UserDetails user = userDetailsService.loadUserByUsername(userId);

        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );
    }

    // [fix] 수정 전: 모든 예외를 silently swallow(catch 후 false 반환만) | 이유: 토큰 검증 실패에 대한 감사 로그 부재 → 공격 탐지 불가
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    // [removed] 삭제 전: getUserIdFromToken(String token) | 이유: parseAccessToken/parseRefreshToken으로 대체된 이후 production 코드에서 미사용

    public long getAccessTokenValidityInSeconds() {
        return accessTokenValidity.toSeconds();
    }
}
