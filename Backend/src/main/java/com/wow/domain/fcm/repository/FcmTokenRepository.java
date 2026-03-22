package com.wow.domain.fcm.repository;

import com.wow.domain.fcm.entity.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {

    Optional<FcmToken> findByToken(String token);

    List<FcmToken> findAllByUserId(String userId);

    void deleteByUserId(String userId);

    void deleteByToken(String token);

}
