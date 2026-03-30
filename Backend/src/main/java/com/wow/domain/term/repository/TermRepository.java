package com.wow.domain.term.repository;

import com.wow.domain.term.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TermRepository extends JpaRepository<Term, Long> {

    List<Term> findAllByOrderByIdAsc();

    List<Term> findAllByRequiredTrueAndEffectiveAtLessThanEqualOrderByIdAsc(LocalDate date);

    Optional<Term> findFirstByRequiredTrueAndEffectiveAtLessThanEqualOrderByEffectiveAtDescIdDesc(LocalDate date);
}
