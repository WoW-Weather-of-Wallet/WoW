import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { mockSelectableTransactions } from '../../mock/calendar';
import { COLORS, hp } from '../../constants/theme';
import { styles } from './CalendarScreen.styles';
import { useCalendarMockState } from '../../hooks/useCalendarMockState';
import {
  CalendarAddEntrySheet,
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
    isAddEntryVisible,
    defaultAddEntryDateKey,
    selectedTransactionId,
    selectedDetail,
    selectedTransaction,
    editingManageItem,
    fixedExpensesTotal,
    headerFetchState,
    headerErrorMessage,
    weatherIconName,
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
    setIsAddEntryVisible,
    setSelectedTransactionId,
    setEditingManageId,
    handleRegisterFixedExpense,
    handleToggleManageItem,
    handleDeleteManageItem,
    handleEditManageItem,
    handleSaveManualEntries,
  } = useCalendarMockState();

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // [UX-Fix] 알림 클릭 등을 통한 딥링크(네비게이션 파라미터) 처리
  React.useEffect(() => {
    if (route.params?.action === 'add_record') {
      // 내역 추가 모달 열기
      setIsAddEntryVisible(true);
      
      // 처리 후 파라미터 초기화 (다시 들어왔을 때 또 열리지 않도록)
      navigation.setParams({ action: undefined });
    }
  }, [route.params?.action]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />

      <View style={[styles.topDock, { paddingTop: insets.top + hp(12) }]}>
        {/*
          원래 화면 기준:
          - 보라색 히어로 카드가 화면 첫 인상을 만들고 있었습니다.

          변경 이유:
          - 새 상단 바 대신 기존 히어로 카드를 그대로 고정해, 익숙한 UI를 유지하면서도
            월 이동과 내역 추가 조작을 항상 상단에서 할 수 있게 맞춥니다.
        */}
        <CalendarHeroCard
          overview={overview}
          monthLabel={monthLabel}
          weatherIconName={weatherIconName}
          headerFetchState={headerFetchState}
          headerErrorMessage={headerErrorMessage}
          onPressPrevMonth={() => handleMoveMonth('prev')}
          onPressNextMonth={() => handleMoveMonth('next')}
          onPressAdd={() => setIsAddEntryVisible(true)}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: insets.bottom + hp(130),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
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

      <CalendarAddEntrySheet
        visible={isAddEntryVisible}
        defaultDateKey={defaultAddEntryDateKey}
        onClose={() => setIsAddEntryVisible(false)}
        onCompleteManualEntries={handleSaveManualEntries}
        onCompleteExcelEntries={handleSaveManualEntries}
      />

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
        submitLabel={editingManageItem ? '고정지출 정보 수정하기' : '고정지출로 등록하기'}
        onClose={() => {
          setIsDetailSheetVisible(false);
          setEditingManageId(null);
        }}
        onSubmit={handleRegisterFixedExpense}
      />
    </View>
  );
}
