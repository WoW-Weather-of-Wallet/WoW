import { StyleSheet } from 'react-native';
import { COLORS, wp } from '../../constants/theme';

export const BEAD_SIZE = wp(12);
export const SMALL_BEAD_SIZE = wp(4);
export const RIPPLE_COUNT = 3;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: wp(40),
    marginVertical: wp(24),
  },
  compactContainer: {
    height: wp(28),
    marginVertical: 0,
  },
  beadWrapper: {
    width: BEAD_SIZE * 2,
    height: BEAD_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bead: {
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    backgroundColor: COLORS.border,
    zIndex: 10,
  },
  activeBead: {
    backgroundColor: COLORS.primary,
  },
  completedBead: {
    backgroundColor: COLORS.primary,
  },
  activeGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rippleCircle: {
    position: 'absolute',
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    backgroundColor: COLORS.primary,
  },
  connectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginHorizontal: wp(4),
  },
  smallBead: {
    width: SMALL_BEAD_SIZE,
    height: SMALL_BEAD_SIZE,
    borderRadius: SMALL_BEAD_SIZE / 2,
    backgroundColor: COLORS.border,
  },
  completedSmallBead: {
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
});
