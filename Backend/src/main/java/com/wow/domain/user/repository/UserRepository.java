package com.wow.domain.user.repository;

import com.wow.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // [removed] 삭제 전: existsByUserId, existsBySsafyOauthId | 이유: 호출부 없음, 모든 중복 체크는 existsByUserIdOrSsafyOauthId로 통일
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByUserIdOrSsafyOauthId(String userId, String ssafyOauthId);
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.name = :name AND u.gender = :gender AND u.birthDate = :birthDate AND u.phoneNumber = :phoneNumber")
    boolean existsDuplicate(@Param("name") String name, @Param("gender") String gender, @Param("birthDate") LocalDate birthDate, @Param("phoneNumber") String phoneNumber);
    Optional<User> findByUserId(String userId);
    List<User> findAllByAlarmEnabledTrue();
    Optional<User> findBySsafyOauthId(String ssafyOauthId);
    /*
     * 수정 이유:
     * - 아이디 찾기 본인 확인 조건을 gender까지 포함하도록 강화했습니다.
     *
     * 수정 전 코드:
     * - Optional<User> findByNameAndBirthDateAndPhoneNumber(String name, LocalDate birthDate, String phoneNumber);
     */
    Optional<User> findByNameAndGenderAndBirthDateAndPhoneNumber(String name, String gender, LocalDate birthDate, String phoneNumber);
    /*
     * 수정 이유:
     * - findPassword의 본인확인 조건이 findId(name+gender+birthDate+phoneNumber)보다 약했습니다.
     * - gender를 추가하여 findId와 동일한 수준의 신원 확인 강도를 유지합니다.
     *
     * 수정 전 코드:
     * - Optional<User> findByUserIdAndNameAndBirthDateAndPhoneNumber(String userId, String name, LocalDate birthDate, String phoneNumber);
     */
    Optional<User> findByUserIdAndNameAndGenderAndBirthDateAndPhoneNumber(String userId, String name, String gender, LocalDate birthDate, String phoneNumber);

}
