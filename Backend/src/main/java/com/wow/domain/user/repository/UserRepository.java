package com.wow.domain.user.repository;

import com.wow.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUserId(String userId);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByUserId(String userId);
    Optional<User> findBySsafyOauthId(String userId);

}
