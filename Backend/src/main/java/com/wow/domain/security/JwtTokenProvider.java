package com.wow.domain.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

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

    // Access Token 생성
    public String createAccessToken(String userId, List<String> roles) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenValidity);

        return Jwts.builder()
                .subject(userId)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim("roles", roles)
                .signWith(key)
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken(String userId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(refreshTokenValidity);

        return Jwts.builder()
                .subject(userId)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
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
        return jws.getPayload();
    }

    public Authentication getAuthentication(String token) {

        String userId = getUserIdFromToken(token);

        UserDetails user = userDetailsService.loadUserByUsername(userId);

        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );

    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    // 설정된 토큰의 유효 기간(Duration) 반환
    public long getAccessTokenValidityInSeconds() {
        return accessTokenValidity.toSeconds();
    }

}
