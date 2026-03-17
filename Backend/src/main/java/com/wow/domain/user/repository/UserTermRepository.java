package com.wow.domain.user.repository;

import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTermRepository extends JpaRepository<UserTerm, Long> {

    void deleteByUser(User user);

}
