import { StyleSheet } from 'react-native';
import { COLORS, RADIUS, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarOverlay: {
    alignItems: 'center',
  },
  progressBarContainer: {
    width: wp(200),
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});
