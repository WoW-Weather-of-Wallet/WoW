import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './ProfileEditHeader.styles';

interface ProfileEditHeaderProps {
  name: string;
  onEditPress?: () => void;
}

/**
 * 프로젝트의 디자인 톤앤매너를 유지한 프로필 수정 헤더 컴포넌트입니다.
 * 원형 아바타 하단에 편집 버튼을 배치하여 직관적인 UX를 제공합니다.
 */
export default function ProfileEditHeader({ name, onEditPress }: ProfileEditHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editBadge} 
          activeOpacity={0.7}
          onPress={onEditPress}
        >
          <Ionicons name="camera" size={wp(14)} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.nameText}>{name}님</Text>
      <Text style={styles.emailText}>개인정보 및 서비스 설정을 관리하세요</Text>
    </View>
  );
}

