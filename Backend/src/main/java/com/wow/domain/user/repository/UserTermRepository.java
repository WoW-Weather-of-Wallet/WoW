package com.wow.domain.user.repository;

import com.wow.domain.term.entity.Term;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import org.springframework.data.jpa.repository.JpaRepository;

// [removed] 삭제 전: void deleteByUser(User user) | 이유: User.userTerms에 cascade = REMOVE + orphanRemoval = true 설정 및
//   UserTerm.user에 @OnDelete(CASCADE)가 중첩 적용되어 있어 명시적 삭제 호출이 불필요한 dead code
public interface UserTermRepository extends JpaRepository<UserTerm, Long> {

    boolean existsByUserAndTermAndAgreedTrue(User user, Term term);

}
