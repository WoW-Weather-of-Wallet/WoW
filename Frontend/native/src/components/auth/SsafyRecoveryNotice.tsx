import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './SsafyRecoveryNotice.styles';

interface SsafyRecoveryNoticeProps {
  onLinkPress: () => void;
}

/**
 * SSAFY 통합 계정 사용자를 위한 안내 컴포넌트입니다.
 * 외부 링크(SSAFY 포털)로 유도하는 하이퍼링크를 포함합니다.
 */
export default function SsafyRecoveryNotice({ onLinkPress }: SsafyRecoveryNoticeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Ionicons 
          name="information-circle-outline" 
          size={wp(20)} 
          color={COLORS.textSecondary} 
          style={styles.infoIcon}
        />
        <View style={styles.textWrapper}>
          <Text style={styles.noticeText}>
            SSAFY 계정으로 가입하신 분은 앱 내에서 직접 찾기를 지원하지 않습니다.
          </Text>
          <TouchableOpacity onPress={onLinkPress} activeOpacity={0.6}>
            <Text style={styles.linkText}>SSAFY 계정으로 로그인/찾기 안내 바로가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


