import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, hp } from '../../constants/theme';
import { styles } from './CalendarScreen.styles';
import { useCalendarMockState } from '../../hooks/useCalendarMockState';
import { setHideCalendarGuide, shouldHideCalendarGuide } from '../../services/guidePreference';
import DataSourceNotice from '../../components/common/DataSourceNotice';
import {
  CalendarAddEntrySheet,
  CalendarDayDetailSheet,
  CalendarGuideModal,
  FixedExpenseDetailSheet,
  CalendarHeroCard,
  CalendarMonthCard,
  CalendarTabSwitcher,
  FixedExpenseManageModal,
  FixedExpensePickerSheet,
  FixedExpenseSection,
  TransactionHistorySection,
} from '../../components/calendar';
import type { MainTabNavigationProp, MainTabRouteProp } from '../../types';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const hasCheckedGuideRef = React.useRef(false);
  const [isGuideVisible, setIsGuideVisible] = React.useState(false);
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
  } = useCalendarMockState();

  const route = useRoute<MainTabRouteProp<'Calendar'>>();
  const navigation = useNavigation<MainTabNavigationProp<'Calendar'>>();

  // [UX-Fix] 알림 클릭 등을 통한 딥링크(네비게이션 파라미터) 처리
  React.useEffect(() => {
    if (route.params?.action === 'add_record') {
      // 내역 추가 모달 열기
      setIsAddEntryVisible(true);

      // 처리 후 파라미터 초기화 (다시 들어왔을 때 또 열리지 않도록)
      navigation.setParams({ action: undefined });
    }
  }, [route.params?.action]);

  // 가이드 자동 노출 로직 제거 (수동 호출 방식으로 변경)

  const handleCloseGuide = React.useCallback(() => {
    setIsGuideVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />

      <View style={[styles.topDock, { paddingTop: insets.top + hp(12) }]}>
        {false && <DataSourceNotice
          type={headerFetchState === 'live' ? 'mixed' : 'mock'}
          description={
            headerFetchState === 'live'
              ? '헤더 일부는 실데이터이고, 메모와 일부 월 데이터 및 고정지출 흐름에는 mock 또는 fallback 데이터가 포함됩니다.'
              : '현재 캘린더 화면은 mock 또는 fallback 데이터가 포함되어 있습니다.'
          }
          style={styles.notice}
        />}
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
          onPressInfo={() => setIsGuideVisible(true)}
        />

        {/*
          변경 이유:
          - 캘린더/전체내역 토글은 화면 문맥 전환 역할이라 스크롤에 밀려 내려가면
            사용성이 떨어집니다.
          - 히어로 카드 바로 아래 고정 영역으로 올려, 화면 어디서든 같은 위치에서
            보기 전환이 가능하도록 정리합니다.
        */}
        <View style={styles.tabWrap}>
          <CalendarTabSwitcher activeTab={activeTab} onChange={setActiveTab} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: tabBarHeight + hp(30),
          },
        ]}
        showsVerticalScrollIndicator={false}
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
      </ScrollView>

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
        initialCategory={editingManageItem?.category}
        initialPaymentDay={editingManageItem?.paymentDay}
        submitLabel={editingManageItem ? '고정지출 정보 수정하기' : '고정지출로 등록하기'}
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
    </View>
  );
}
