package com.wow.domain.user.repository;

import com.wow.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUserId(String userId);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsBySsafyOauthId(String ssafyOauthId);
    boolean existsByNameAndGenderAndBirthDate(String name, String gender, LocalDate birthDate);
    Optional<User> findByUserId(String userId);
    Optional<User> findBySsafyOauthId(String ssafyOauthId);

}
