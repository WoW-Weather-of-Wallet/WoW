import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { SpendingStyle } from '../../constants/main/spendingStyle';
import { wp } from '../../constants/theme';
import { styles } from './SpendingStyleGuideModal.styles';

type SpendingStyleGuideSlideProps = {
  styleItem: SpendingStyle;
};

export default function SpendingStyleGuideSlide({
  styleItem,
}: SpendingStyleGuideSlideProps) {
  return (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: styleItem.color + '15' }]}>
        {styleItem.iconType === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons
            name={styleItem.iconName as any}
            size={wp(64)}
            color={styleItem.color}
          />
        ) : (
          <Ionicons
            name={styleItem.iconName as any}
            size={wp(64)}
            color={styleItem.color}
          />
        )}
      </View>
      <Text style={styles.styleTitle}>{styleItem.title}</Text>

      {styleItem.id === 7 ? (
        <Text style={styles.styleDescription}>
          ?ëŒ€ë’“ ??ç§»ëŒ„ë€’æ€¨ì¢Šâ”??ç§»ì„ìŠ¦ç§»ì„? ?ë”„í€¬{' '}
          <Text style={styles.emphasizedText}>ï§â‘¤ë±º éºê¾©ë¹ž?ë¨¯ê½Œ</Text>{' '}
          æ´¹ì¢ì‚Ž ?ë‡ì¾¶ ?ëš®í‰¬?ì„Žë’— ?ë‰ì ™?ê³¸ì”¤ ?ã…½??ì‡±ì” ?ë¨¯ìŠ‚.
        </Text>
      ) : styleItem.description ? (
        <Text style={styles.styleDescription}>{styleItem.description}</Text>
      ) : (
        <View style={styles.tagContainer}>
          <View style={styles.tagRow}>
            {styleItem.hashtags?.slice(0, 2).map((tag, idx) => (
              <View key={`${styleItem.id}-${idx}`} style={styles.tagBadge}>
                <Text style={[styles.tagText, { color: styleItem.color }]}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.tagRow}>
            {styleItem.hashtags?.slice(2, 3).map((tag, idx) => (
              <View key={`${styleItem.id}-tail-${idx}`} style={styles.tagBadge}>
                <Text style={[styles.tagText, { color: styleItem.color }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
