import { Dimensions, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - wp(40); // tsx 파일의 상수와 동기화

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // 더 부드러운 배경 어두움
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    paddingBottom: hp(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    paddingTop: hp(24),
    paddingHorizontal: wp(24),
    marginBottom: hp(16),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(8),
  },
  modalTitle: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(8),
  },
  modalSubTitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(18),
    textAlign: 'left',
  },
  emphasizedText: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  closeButton: {
    padding: wp(4),
    marginRight: wp(-4), // 패딩 보정하여 우측 끝 정렬
  },
  slide: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingHorizontal: wp(24),
    paddingBottom: hp(12),
  },
  iconContainer: {
    width: wp(110),
    height: wp(110),
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(24),
  },
  styleTitle: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
    textAlign: 'center',
  },
  styleDescription: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(24),
    textAlign: 'center',
    paddingHorizontal: wp(10),
    width: '100%', // 가로를 가득 채우도록 변경
  },
  tagContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: hp(8),
    width: '100%',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(8),
  },
  tagBadge: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary, // 은은한 배경 위젯 느낌
  },
  tagText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
  },
  footer: {
    marginTop: hp(12),
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: wp(6),
  },
  dot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: COLORS.gray200,
  },
  activeDot: {
    width: wp(18), // 활성 도트는 조금 길게 (슬림한 대시 느낌)
    backgroundColor: COLORS.primary,
  },
});
