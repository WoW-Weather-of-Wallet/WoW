import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(14),
  },
  iconWrap: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.sheetIconBackground,
  },
  textBlock: { flex: 1 },
  eyebrow: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(2),
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingTop: hp(4), // 글씨를 아래로 아주 살짝 내림
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
  },
  infoButton: {
    padding: wp(4),
  },
});
