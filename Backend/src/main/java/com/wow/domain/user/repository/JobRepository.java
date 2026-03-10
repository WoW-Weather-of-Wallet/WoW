package com.wow.domain.user.repository;

import com.wow.domain.user.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}
