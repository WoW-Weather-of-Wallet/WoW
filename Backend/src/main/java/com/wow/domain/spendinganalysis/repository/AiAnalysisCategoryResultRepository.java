package com.wow.domain.spendinganalysis.repository;

import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiAnalysisCategoryResultRepository extends JpaRepository<AiAnalysisCategoryResult, Long> {

    List<AiAnalysisCategoryResult> findByAiAnalysis_IdOrderByMyRatioDesc(Long aiAnalysisId);
}
