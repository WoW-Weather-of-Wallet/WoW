package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.FixedExpenseManageResponse;
import com.wow.domain.calendar.entity.FixedExpense;
import com.wow.domain.calendar.repository.FixedExpenseRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.common.BusinessException;
import com.wow.global.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FixedExpenseService {

    private final FixedExpenseRepository fixedExpenseRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // 관리페이지 전체 목록 조회
    public FixedExpenseManageResponse getFixedExpenseManage(
            Long userId, int year, int month) {

        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<FixedExpense> fixedExpenses =
                fixedExpenseRepository.findByUser_IdOrderByDueDayAsc(userId);

        List<FixedExpenseManageResponse.FixedExpenseManageItem> items = fixedExpenses.stream()
                .map(fe -> FixedExpenseManageResponse.FixedExpenseManageItem.of(
                        fe, year, month, transactionRepository))
                .toList();

        // 활성화된 항목만 합계 계산
        int totalAmount = items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsEnable()))
                .mapToInt(FixedExpenseManageResponse.FixedExpenseManageItem::getAmount)
                .sum();

        return new FixedExpenseManageResponse(totalAmount, items);
    }
}