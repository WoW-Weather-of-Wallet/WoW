package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.entity.FixedExpense;
import com.wow.domain.calendar.entity.Transaction;
import com.wow.domain.calendar.repository.FixedExpenseRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.NotFoundException;
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

    public FixedExpenseManageResponse getFixedExpenseManage(
            Long userId, int year, int month) {

        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        List<FixedExpense> fixedExpenses =
                fixedExpenseRepository.findByUser_IdOrderByDueDayAsc(userId);

        List<FixedExpenseManageResponse.FixedExpenseManageItem> items = fixedExpenses.stream()
                .map(fe -> FixedExpenseManageResponse.FixedExpenseManageItem.of(
                        fe, year, month, transactionRepository))
                .toList();

        int totalAmount = items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsEnable()))
                .mapToInt(FixedExpenseManageResponse.FixedExpenseManageItem::getAmount)
                .sum();

        return new FixedExpenseManageResponse(totalAmount, items);
    }

    @Transactional
    public FixedExpenseAddResponse addFixedExpense(
            Long userId, FixedExpenseAddRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new BadRequestException("존재하지 않는 거래내역입니다."));

        if (fixedExpenseRepository.existsByTransaction_Id(request.getTransactionId())) {
            throw new DuplicateException("이미 고정지출로 등록된 거래내역입니다.");
        }

        if (fixedExpenseRepository.existsByUser_IdAndName(userId, transaction.getMerchantName())) {
            throw new DuplicateException("이미 고정지출로 등록된 거래내역입니다.");
        }

        String icon = null;
        if (transaction.getCategory() != null) {
            icon = transaction.getCategory().getCategoryIcon();
        }

        FixedExpense fixedExpense = FixedExpense.builder()
                .user(user)
                .transaction(transaction)
                .icon(icon)
                .name(transaction.getMerchantName())
                .amount(transaction.getAmount().intValue())
                .dueDay(request.getDueDay())
                .isAuto(request.getIsAuto() != null ? request.getIsAuto() : false)
                .isEnable(true)
                .build();

        fixedExpenseRepository.save(fixedExpense);

        return new FixedExpenseAddResponse(
                fixedExpense.getId(),
                fixedExpense.getName(),
                true
        );
    }

    @Transactional
    public FixedExpenseUpdateResponse updateFixedExpense(
            Long userId, Long fixedExpenseId, FixedExpenseUpdateRequest request) {

        FixedExpense fixedExpense = fixedExpenseRepository.findById(fixedExpenseId)
                .orElseThrow(() -> new NotFoundException("고정지출 항목을 찾을 수 없습니다."));

        if (!fixedExpense.getUser().getId().equals(userId)) {
            throw new BadRequestException("수정 권한이 없습니다.");
        }

        fixedExpense.update(request.getIcon(), request.getAmount(), request.getDueDay());

        return new FixedExpenseUpdateResponse(
                fixedExpense.getId(),
                fixedExpense.getName()
        );
    }

    @Transactional
    public void deleteFixedExpense(Long userId, Long fixedExpenseId) {

        FixedExpense fixedExpense = fixedExpenseRepository.findById(fixedExpenseId)
                .orElseThrow(() -> new NotFoundException("고정지출 항목을 찾을 수 없습니다."));

        // 본인 소유 확인
        if (!fixedExpense.getUser().getId().equals(userId)) {
            throw new BadRequestException("삭제 권한이 없습니다.");
        }

        fixedExpenseRepository.delete(fixedExpense);
    }

    // 토글(직접입력형식)
    @Transactional
    public FixedExpenseEnableResponse updateFixedExpenseEnable(
            Long userId, Long fixedExpenseId, FixedExpenseEnableRequest request) {

        FixedExpense fixedExpense = fixedExpenseRepository.findById(fixedExpenseId)
                .orElseThrow(() -> new NotFoundException("고정지출 항목을 찾을 수 없습니다."));

        if (!fixedExpense.getUser().getId().equals(userId)) {
            throw new BadRequestException("수정 권한이 없습니다.");
        }

        fixedExpense.updateEnable(request.getIsEnable());

        return new FixedExpenseEnableResponse(
                fixedExpense.getId(),
                fixedExpense.getIsEnable()
        );
    }
}