package com.wow.domain.spendinganalysis.repository;

import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {

    Optional<AiAnalysis> findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
            Long userId,
            String analysisType
    );
}
