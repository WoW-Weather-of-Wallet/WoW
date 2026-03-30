package com.wow.domain.spendinganalysis.repository;

import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {

    Optional<AiAnalysis> findFirstByUser_IdAndYearAndMonthAndAnalysisTypeOrderByCreatedAtDescIdDesc(
            Long userId,
            Integer year,
            Integer month,
            AiAnalysisType analysisType
    );

    Optional<AiAnalysis> findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
            Long userId,
            AiAnalysisType analysisType
    );

    void deleteByUser_IdAndYearAndMonthAndAnalysisType(
            Long userId,
            Integer year,
            Integer month,
            AiAnalysisType analysisType
    );
}
