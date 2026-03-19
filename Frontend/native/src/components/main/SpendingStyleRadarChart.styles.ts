import { StyleSheet } from 'react-native';
import { wp } from '../../constants/theme';

export const DEFAULT_SIZE = wp(164);

export const styles = StyleSheet.create({
  container: {
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
