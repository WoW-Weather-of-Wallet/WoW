import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

const JOBS = [
  { id: 'STUDENT', label: '학생' },
  { id: 'UNEMPLOYED', label: '무직' },
];

export default function JobSelectionScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // 전달받은 기존 회원가입 파라미터가 있을 경우 계속 들고 감 (가입 플로우 이어나감)
  const previousParams = route.params || {};

  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedJob) return;
    
    // 직업 정보를 덧붙여서 다음 온보딩 또는 최종 메인으로 이동
    const finalData = { ...previousParams, job: selectedJob };
    console.log('최종 수집된 온보딩 데이터:', finalData);
    
    // TODO: 다음 온보딩 화면(예: 자산 연동 수락, 투자성향 등)으로 넘어가거나
    // 임시로 로그인 화면/메인 화면으로 보냄
    
    // 임시 처리: 메인 네비게이션이 아직 없으므로, 완료되었다는 로그와 함께 루트로 보냄.
    alert('가입 및 온보딩이 거의 완료되었습니다! (추후 로직 연동)');
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      {/* 백엔드 연동 전까지 회원님의 정보를 모을 와이어프레임 구조 */}
      <View style={[styles.mainLayout, { paddingTop: insets.top + hp(60), paddingBottom: insets.bottom || hp(24) }]}>
        
        {/* 상단 타이틀 구역 */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerSection}>
          <Text style={styles.title}>회원님의 직업을{'\n'}알려주세요!</Text>
        </Animated.View>

        {/* 중앙 직업 선택 Pill 버튼 구역 */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.selectionSection}>
          <View style={styles.chipContainer}>
            {JOBS.map((job) => {
              const isActive = selectedJob === job.id;
              return (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedJob(job.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {job.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* 하단 메인 액션 구역 */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.confirmButton, selectedJob ? styles.confirmButtonActive : styles.confirmButtonInactive]} 
            onPress={handleNext}
            disabled={!selectedJob}
          >
            <Text style={[styles.confirmButtonText, selectedJob ? styles.confirmButtonTextActive : styles.confirmButtonTextInactive]}>
              확인
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    paddingHorizontal: wp(28),
    marginBottom: hp(40),
  },
  title: {
    fontSize: fp(32),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(46),
    letterSpacing: -0.5,
  },
  selectionSection: {
    flex: 1,
    paddingHorizontal: wp(28),
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',     // 수평 중앙 정렬
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(12),
    rowGap: hp(16),
  },
  chip: {
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
    borderRadius: wp(100), // 완전히 둥근 원형(Pill) 타원 모서리
    borderWidth: 1.5,
    borderColor: '#E5E7EB', // 기본 회색 선
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: fp(20),
    fontFamily: FONTS.semiBold,
    color: '#1A1A1A',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    paddingHorizontal: wp(28),
    justifyContent: 'flex-end',
    paddingTop: hp(10),
  },
  confirmButton: {
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  confirmButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonActive: {
    backgroundColor: '#1A1A1A', // 프라이머리 혹은 딥블랙 포인트
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
  },
  confirmButtonTextInactive: {
    color: '#1A1A1A',
  },
  confirmButtonTextActive: {
    color: '#FFFFFF',
  },
});
