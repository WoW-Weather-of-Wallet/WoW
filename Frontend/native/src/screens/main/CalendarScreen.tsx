import React from 'react';
import { hp } from '../../constants/theme';
import { styles } from './CalendarScreen.styles';
import { useCalendarScreenFlow } from '../../hooks';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import {
  CalendarAddEntrySheet,
  CalendarDayDetailSheet,
  CalendarGuideModal,
  CalendarMonthCard,
  CalendarTopDockContent,
  FixedExpenseDetailSheet,
  FixedExpenseManageModal,
  FixedExpensePickerSheet,
  FixedExpenseSection,
  TransactionHistorySection,
} from '../../components/calendar';

export default function CalendarScreen() {
  const {
    overview,
    monthLabel,
    calendarDays,
    activeTab,
    selectedDateKey,
    memoValue,
    fixedExpenseItems,
    fixedExpenseDetailsByCategory,
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
    selectableTransactions,
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
    handleToggleFixedExpenseExpand,
    handleToggleManageItem,
    handleDeleteManageItem,
    handleEditManageItem,
    handleOpenFixedExpensePicker,
    handleSaveManualEntries,
    handleSaveExcelEntries,
    handleSaveMemo,
    isGuideVisible,
    handleOpenGuide,
    handleCloseGuide,
    handleOpenAddEntry,
  } = useCalendarScreenFlow();

  return (
    <>
      <BottomTabScreenLayout
        containerStyle={styles.container}
        topDockStyle={styles.topDock}
        topDockTopPadding={hp(12)}
        topDockContent={
          <CalendarTopDockContent
            overview={overview}
            monthLabel={monthLabel}
            weatherIconName={weatherIconName}
            headerFetchState={headerFetchState}
            headerErrorMessage={headerErrorMessage}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onPressPrevMonth={() => handleMoveMonth('prev')}
            onPressNextMonth={() => handleMoveMonth('next')}
            onPressAdd={handleOpenAddEntry}
            onPressInfo={handleOpenGuide}
            noticeStyle={styles.notice}
            tabWrapStyle={styles.tabWrap}
          />
        }
        scrollViewStyle={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        scrollTopPadding={hp(8)}
        scrollBottomPadding={hp(30)}
      >
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
              detailItemsByCategory={fixedExpenseDetailsByCategory}
              onToggleExpand={handleToggleFixedExpenseExpand}
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
      </BottomTabScreenLayout>

      <CalendarAddEntrySheet
        visible={isAddEntryVisible}
        defaultDateKey={defaultAddEntryDateKey}
        onClose={() => setIsAddEntryVisible(false)}
        onCompleteManualEntries={handleSaveManualEntries}
        onCompleteExcelEntries={handleSaveExcelEntries}
      />

      <CalendarDayDetailSheet
        detail={selectedDetail}
        visible={selectedDetail !== null}
        memoValue={memoValue}
        onChangeMemo={setMemoValue}
        onSaveMemo={handleSaveMemo}
        onClose={() => setSelectedDateKey(null)}
      />

      <FixedExpenseManageModal
        visible={isManageModalVisible}
        totalAmount={fixedExpensesTotal}
        items={manageItems}
        onClose={() => setIsManageModalVisible(false)}
        onPressAdd={handleOpenFixedExpensePicker}
        onPressEdit={handleEditManageItem}
        onToggleItem={handleToggleManageItem}
        onDeleteItem={handleDeleteManageItem}
      />

      <FixedExpensePickerSheet
        visible={isPickerVisible}
        items={selectableTransactions}
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
        mode={editingManageItem ? 'edit' : 'create'}
        initialCategory={editingManageItem?.category}
        initialPaymentDay={editingManageItem?.paymentDay}
        submitLabel={editingManageItem ? '수정하기' : '고정지출로 등록하기'}
        onClose={() => {
          setIsDetailSheetVisible(false);
          setEditingManageId(null);
        }}
        onSubmit={handleRegisterFixedExpense}
      />

      <CalendarGuideModal
        visible={isGuideVisible}
        onClose={handleCloseGuide}
      />
    </>
  );
}
