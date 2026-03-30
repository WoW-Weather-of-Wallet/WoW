package com.wow.domain.spendinganalysis.repository;

import com.wow.domain.spendinganalysis.entity.SpendingType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpendingTypeRepository extends JpaRepository<SpendingType, Long> {
}
