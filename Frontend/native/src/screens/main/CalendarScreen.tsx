import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockSelectableTransactions } from '../../mock/calendar';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';
import { useCalendarMockState } from '../../hooks/useCalendarMockState';
import {
  CalendarDayDetailSheet,
  FixedExpenseDetailSheet,
  CalendarHeroCard,
  CalendarMonthCard,
  CalendarTabSwitcher,
  FixedExpenseManageModal,
  FixedExpensePickerSheet,
  FixedExpenseSection,
  TransactionHistorySection,
} from '../../components/calendar';

/**
 * 캘린더 화면은 조립 역할만 담당한다.
 * 실제 상태 변경과 mock 기반 플로우는 전용 훅으로 분리해 화면 파일을 최대한 얇게 유지한다.
 */
export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const {
    overview,
    monthLabel,
    calendarDays,
    activeTab,
    selectedDateKey,
    memoValue,
    fixedExpenseItems,
    manageItems,
    transactionGroups,
    isManageModalVisible,
    isPickerVisible,
    isDetailSheetVisible,
    selectedTransactionId,
    selectedDetail,
    selectedTransaction,
    editingManageItem,
    fixedExpensesTotal,
    handleMoveMonth,
    historyTitle,
    emptyHistoryTitle,
    emptyHistoryDescription,
    setActiveTab,
    setSelectedDateKey,
    setMemoValue,
    setIsManageModalVisible,
    setIsPickerVisible,
    setIsDetailSheetVisible,
    setSelectedTransactionId,
    setEditingManageId,
    handleRegisterFixedExpense,
    handleToggleManageItem,
    handleDeleteManageItem,
    handleEditManageItem,
  } = useCalendarMockState();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: insets.bottom + hp(130),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CalendarHeroCard
          overview={overview}
          monthLabel={monthLabel}
          onPressPrevMonth={() => handleMoveMonth('prev')}
          onPressNextMonth={() => handleMoveMonth('next')}
        />

        <View style={styles.tabWrap}>
          <CalendarTabSwitcher activeTab={activeTab} onChange={setActiveTab} />
        </View>

        {activeTab === 'calendar' ? (
          <>
            <CalendarMonthCard
              days={calendarDays}
              selectedDateKey={selectedDateKey}
              onSelectDate={setSelectedDateKey}
            />
            <FixedExpenseSection
              totalAmount={fixedExpensesTotal}
              items={fixedExpenseItems}
              onPressManage={() => setIsManageModalVisible(true)}
            />
          </>
        ) : (
          <TransactionHistorySection
            monthLabel={historyTitle}
            groups={transactionGroups}
            emptyTitle={emptyHistoryTitle}
            emptyDescription={emptyHistoryDescription}
          />
        )}
      </ScrollView>

      <CalendarDayDetailSheet
        detail={selectedDetail}
        visible={selectedDetail !== null}
        memoValue={memoValue}
        onChangeMemo={setMemoValue}
        onClose={() => setSelectedDateKey(null)}
      />

      <FixedExpenseManageModal
        visible={isManageModalVisible}
        totalAmount={fixedExpensesTotal}
        items={manageItems}
        onClose={() => setIsManageModalVisible(false)}
        onPressAdd={() => setIsPickerVisible(true)}
        onPressEdit={handleEditManageItem}
        onToggleItem={handleToggleManageItem}
        onDeleteItem={handleDeleteManageItem}
      />

      <FixedExpensePickerSheet
        visible={isPickerVisible}
        items={mockSelectableTransactions}
        selectedId={selectedTransactionId}
        onSelect={setSelectedTransactionId}
        onConfirm={() => {
          setIsPickerVisible(false);
          setIsDetailSheetVisible(true);
        }}
        onClose={() => setIsPickerVisible(false)}
      />

      <FixedExpenseDetailSheet
        visible={isDetailSheetVisible}
        item={selectedTransaction}
        initialCategory={editingManageItem?.category}
        initialPaymentDay={editingManageItem?.paymentDay}
        submitLabel={editingManageItem ? '고정지출 수정하기' : '고정지출로 등록하기'}
        onClose={() => {
          setIsDetailSheetVisible(false);
          setEditingManageId(null);
        }}
        onSubmit={handleRegisterFixedExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  contentContainer: {
    paddingHorizontal: wp(20),
    gap: hp(18),
  },
  tabWrap: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(12),
  },
});
