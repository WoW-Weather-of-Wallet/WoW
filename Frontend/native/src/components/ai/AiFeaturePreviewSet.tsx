import React from 'react';
import { View } from 'react-native';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from '../../screens/ai/AiFeedbackHomeScreen.styles';

export function AiAnalysisPreview() {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.miniUICard}>
        <View style={[styles.miniSkeletonLine, { width: wp(40), marginTop: hp(4) }]} />
        <View style={styles.miniDonutWrapper}>
          <View style={styles.miniDonutBase} />
          <View style={styles.miniDonutActive} />
          <View style={styles.miniDonutCenterText} />
        </View>
        <View style={styles.miniCategoryRow}>
          <View style={[styles.miniCategoryDot, { backgroundColor: COLORS.primary }]} />
          <View style={styles.miniCategoryBarBg}>
            <View
              style={[
                styles.miniCategoryBarFill,
                { width: '70%', backgroundColor: COLORS.primary },
              ]}
            />
          </View>
        </View>
        <View style={styles.miniCategoryRow}>
          <View style={[styles.miniCategoryDot, { backgroundColor: COLORS.chartBlue }]} />
          <View style={styles.miniCategoryBarBg}>
            <View
              style={[
                styles.miniCategoryBarFill,
                { width: '40%', backgroundColor: COLORS.chartBlue },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export function AiGoalPreview() {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.miniUICard}>
        <View style={styles.miniGoalTop}>
          <View style={[styles.miniSkeletonLine, { width: wp(30) }]} />
          <View style={styles.miniGoalAmount} />
        </View>
        <View style={styles.miniProgressBarOuter}>
          <View style={styles.miniProgressBarInner} />
          <View style={styles.miniProgressFlag} />
        </View>
        <View style={styles.miniBarChartRow}>
          {[16, 14, 12, 18, 10, 8, 6].map((height, index) => (
            <View
              key={index}
              style={[
                styles.miniTrendBar,
                {
                  height: hp(height),
                  backgroundColor: index >= 4 ? COLORS.chartGreen : 'rgba(0,0,0,0.08)',
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export function AiNotificationPreview() {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.miniPhoneOutline}>
        <View style={styles.miniPhoneHeader}>
          <View style={styles.miniProfileBlob} />
          <View style={[styles.miniSkeletonLine, { width: wp(30) }]} />
        </View>
        <View style={[styles.miniSkeletonLine, { width: '100%', marginBottom: hp(6) }]} />
        <View style={[styles.miniSkeletonLine, { width: '80%', marginBottom: hp(6) }]} />
        <View style={[styles.miniSkeletonLine, { width: '60%' }]} />

        <View style={styles.miniToast}>
          <View style={styles.miniToastIcon} />
          <View
            style={[
              styles.miniSkeletonLine,
              { flex: 1, height: hp(6), backgroundColor: 'rgba(0,0,0,0.04)' },
            ]}
          />
        </View>
      </View>
    </View>
  );
}
